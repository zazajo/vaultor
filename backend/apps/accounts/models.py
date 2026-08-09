from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.roadmap.models import Phase


class User(AbstractUser):
    """Identity is the wallet, not a password.

    `username` still holds a value (set to `wallet_address` at creation) only
    because `AbstractUser` requires it to be non-empty and unique - nothing
    new should ever read `username`, always read `wallet_address`.
    """

    wallet_address = models.CharField(max_length=44, unique=True, db_index=True)
    referral_code = models.CharField(max_length=16, unique=True, db_index=True)
    # The phase active when this account was first created - "Join at V0 ->
    # earn from V0 onward" from the referral program brief. Referrals can
    # only ever happen after this point chronologically, so no separate
    # gating check is needed elsewhere to honor that promise.
    joined_phase = models.CharField(max_length=10, choices=Phase.Slug.choices, default=Phase.Slug.V0)
    # Stamped once, the moment a referral pushes this user's count to exactly
    # 100 / 500. Eligibility bookkeeping only - actual NFT distribution at
    # V2/V3 is a future, manual, client-driven step, not automated here.
    milestone_100_reached_at = models.DateTimeField(null=True, blank=True)
    milestone_500_reached_at = models.DateTimeField(null=True, blank=True)


class Referral(models.Model):
    """One row per successful referral - the reward ledger.

    No VOT amount is stored here or on User: it's computed on read as
    0.0001 * referrer.referrals_made.count(), so the row count is the single
    source of truth and a stored total can never drift from it.
    """

    referrer = models.ForeignKey(User, related_name='referrals_made', on_delete=models.CASCADE)
    # OneToOne makes double-referral structurally impossible: a wallet can
    # only ever appear as referred_user once.
    referred_user = models.OneToOneField(User, related_name='referred_via', on_delete=models.CASCADE)
    phase_at_referral = models.CharField(max_length=10, choices=Phase.Slug.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.referrer.wallet_address} -> {self.referred_user.wallet_address}'


class AuthChallenge(models.Model):
    """A sign-in nonce, DB-backed rather than cache-backed.

    No CACHES setting exists in settings.py, so Django's default LocMemCache
    would be a private per-process dict - not shared across gunicorn
    workers. A nonce issued by one worker and verified against another would
    fail unpredictably. A durable row sidesteps that regardless of worker
    count.
    """

    wallet_address = models.CharField(max_length=44, db_index=True)
    nonce = models.CharField(max_length=64, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.wallet_address} @ {self.issued_at}'
