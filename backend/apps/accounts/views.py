from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .serializers import (
    ChallengeRequestSerializer,
    ChallengeResponseSerializer,
    MeSerializer,
    VerifyRequestSerializer,
    VerifyResponseSerializer,
)

# Base58 addresses are 32-44 chars - same bounds apps/presale/views.py uses.
# Keeps obviously bad input from reaching the DB on these wide-open endpoints.
MIN_ADDRESS_LENGTH = 32
MAX_ADDRESS_LENGTH = 44


def _validate_address(value):
    if not (MIN_ADDRESS_LENGTH <= len(value) <= MAX_ADDRESS_LENGTH):
        raise ValidationError({'wallet_address': 'Not a valid Solana address.'})


class ChallengeView(GenericAPIView):
    """Issue a fresh sign-in nonce and the exact message to sign for it."""

    serializer_class = ChallengeRequestSerializer

    def post(self, request):
        body = ChallengeRequestSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        wallet_address = body.validated_data['wallet_address'].strip()
        _validate_address(wallet_address)

        _challenge, message = services.create_challenge(wallet_address)
        payload = {
            'nonce': _challenge.nonce,
            'message': message,
            'expires_at': _challenge.expires_at,
        }
        return Response(ChallengeResponseSerializer(payload).data)


class VerifyView(GenericAPIView):
    """Verify a signed challenge, get-or-create the wallet's account, issue a token."""

    serializer_class = VerifyRequestSerializer

    def post(self, request):
        body = VerifyRequestSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        data = body.validated_data
        wallet_address = data['wallet_address'].strip()
        _validate_address(wallet_address)

        try:
            user, created = services.verify_sign_in(
                wallet_address,
                data['nonce'],
                data['signature'],
                ref_code=data.get('ref', '').strip() or None,
            )
        except services.AuthError as exc:
            raise AuthenticationFailed(str(exc))

        token, _ = Token.objects.get_or_create(user=user)
        payload = {
            'token': token.key,
            'wallet_address': user.wallet_address,
            'referral_code': user.referral_code,
            'created': created,
        }
        return Response(VerifyResponseSerializer(payload).data)


class MeView(GenericAPIView):
    """The signed-in wallet's referral dashboard data."""

    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        payload = {
            'wallet_address': user.wallet_address,
            'referral_code': user.referral_code,
            'joined_phase': user.joined_phase,
            'referred_count': user.referrals_made.count(),
            'earned_vot': services.earned_vot_for(user),
            'milestone_100_reached_at': user.milestone_100_reached_at,
            'milestone_500_reached_at': user.milestone_500_reached_at,
        }
        return Response(MeSerializer(payload).data)


class LogoutView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=204)
