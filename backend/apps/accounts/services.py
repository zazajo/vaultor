"""Wallet sign-in (challenge/verify) and referral crediting.

Auth has no password: connecting a wallet and signing a server-issued
message *is* the account. First sign-in creates it, a later sign-in is the
same action against the same wallet_address.

Referral rewards are a ledger only in this iteration - earned_vot is never
stored, always computed as VOT_PER_REFERRAL * referrals_made.count(), so a
stored total can never drift from the Referral rows that back it. No VOT
moves on-chain and no NFT gets minted here; milestone timestamps are
eligibility bookkeeping for a manual distribution step later, the same way
Contribution.base_tokens freezes an allocation without transferring tokens
(see apps/presale/services.py).
"""
import base64
import secrets
from decimal import Decimal

import nacl.exceptions
import nacl.signing
import base58
from django.db import IntegrityError
from django.utils import timezone

from apps.core.models import SiteConfig
from .models import AuthChallenge, Referral, User

CHALLENGE_TTL_SECONDS = 5 * 60
REFERRAL_CODE_LENGTH_BYTES = 4  # secrets.token_hex(4) -> 8 hex chars
VOT_PER_REFERRAL = Decimal('0.0001')

MESSAGE_TEMPLATE = (
    'Sign in to Vaultor.\n'
    '\n'
    'Wallet: {wallet_address}\n'
    'Nonce: {nonce}\n'
    'Issued At: {issued_at}\n'
    'Expires At: {expires_at}\n'
)


class AuthError(Exception):
    """Raised for any sign-in failure the view should report as 400/401."""


def _build_message(wallet_address, nonce, issued_at, expires_at):
    return MESSAGE_TEMPLATE.format(
        wallet_address=wallet_address,
        nonce=nonce,
        issued_at=issued_at.isoformat(),
        expires_at=expires_at.isoformat(),
    )


def create_challenge(wallet_address):
    """Issue a fresh, single-use nonce and the exact message to sign for it."""
    now = timezone.now()
    challenge = AuthChallenge.objects.create(
        wallet_address=wallet_address,
        nonce=secrets.token_urlsafe(24),
        expires_at=now + timezone.timedelta(seconds=CHALLENGE_TTL_SECONDS),
    )
    message = _build_message(wallet_address, challenge.nonce, challenge.issued_at, challenge.expires_at)
    return challenge, message


def _consume_challenge(wallet_address, nonce):
    """Atomically mark a challenge used before verifying anything against it.

    Filtering and updating in one statement (rather than fetch-then-check)
    closes the race where two verify requests for the same nonce land on
    different gunicorn workers at once - only one UPDATE can win.
    """
    now = timezone.now()
    updated = AuthChallenge.objects.filter(
        wallet_address=wallet_address,
        nonce=nonce,
        consumed_at__isnull=True,
        expires_at__gt=now,
    ).update(consumed_at=now)

    if updated == 0:
        raise AuthError('This sign-in request has expired or already been used. Request a new one.')

    return AuthChallenge.objects.get(wallet_address=wallet_address, nonce=nonce)


def _verify_signature(wallet_address, message, signature_b64):
    try:
        pubkey_bytes = base58.b58decode(wallet_address)
        signature_bytes = base64.b64decode(signature_b64)
        nacl.signing.VerifyKey(pubkey_bytes).verify(message.encode('utf-8'), signature_bytes)
    except (nacl.exceptions.CryptoError, ValueError, TypeError) as exc:
        raise AuthError('Signature does not match this wallet and message.') from exc


def _generate_referral_code():
    for _ in range(10):
        code = secrets.token_hex(REFERRAL_CODE_LENGTH_BYTES)
        if not User.objects.filter(referral_code=code).exists():
            return code
    raise AuthError('Could not generate a unique referral code. Try again.')


def _maybe_stamp_milestone(referrer):
    count = referrer.referrals_made.count()
    now = timezone.now()
    changed = []
    if count == 100 and referrer.milestone_100_reached_at is None:
        referrer.milestone_100_reached_at = now
        changed.append('milestone_100_reached_at')
    if count == 500 and referrer.milestone_500_reached_at is None:
        referrer.milestone_500_reached_at = now
        changed.append('milestone_500_reached_at')
    if changed:
        referrer.save(update_fields=changed)


def _apply_referral(new_user, ref_code):
    """Create the Referral row for a brand-new account, if ref_code checks out.

    Both self-referral and double-referral are structurally prevented by the
    model (see apps/accounts/models.py): new_user has no referral_code of its
    own to have shared yet, and referred_user is a OneToOneField. The
    wallet_address equality check below is cheap defensive insurance, not
    load-bearing.
    """
    if not ref_code:
        return
    try:
        referrer = User.objects.get(referral_code=ref_code)
    except User.DoesNotExist:
        return  # Unknown/typo'd code - sign-in still succeeds, just unreferred.
    if referrer.wallet_address == new_user.wallet_address:
        return

    Referral.objects.create(
        referrer=referrer,
        referred_user=new_user,
        phase_at_referral=new_user.joined_phase,
    )
    _maybe_stamp_milestone(referrer)


def verify_sign_in(wallet_address, nonce, signature_b64, ref_code=None):
    """Consume the challenge, verify the signature, and get-or-create the account.

    Returns (user, created). Raises AuthError for any failure - an expired/
    reused nonce or a signature that doesn't match are the only ways this can
    fail; everything else (unknown ref code, already-referred wallet) is
    handled silently since it isn't the caller's sign-in that's at fault.
    """
    challenge = _consume_challenge(wallet_address, nonce)
    message = _build_message(wallet_address, nonce, challenge.issued_at, challenge.expires_at)
    _verify_signature(wallet_address, message, signature_b64)

    user = User.objects.filter(wallet_address=wallet_address).first()
    created = user is None

    if created:
        # referral_code and joined_phase are generated up front and passed
        # to create() rather than set afterward: an unset CharField inserts
        # as '' by default, which would collide with any other freshly
        # created (not-yet-assigned) account on the unique constraint.
        try:
            user = User.objects.create(
                wallet_address=wallet_address,
                username=wallet_address,
                referral_code=_generate_referral_code(),
                joined_phase=SiteConfig.load().current_phase,
            )
        except IntegrityError as exc:
            raise AuthError('Could not create an account for this wallet.') from exc
        user.set_unusable_password()
        user.save(update_fields=['password'])
        _apply_referral(user, ref_code)

    return user, created


def earned_vot_for(user):
    return VOT_PER_REFERRAL * user.referrals_made.count()
