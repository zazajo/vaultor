from rest_framework import serializers


class ChallengeRequestSerializer(serializers.Serializer):
    wallet_address = serializers.CharField()


class ChallengeResponseSerializer(serializers.Serializer):
    nonce = serializers.CharField()
    message = serializers.CharField()
    expires_at = serializers.DateTimeField()


class VerifyRequestSerializer(serializers.Serializer):
    wallet_address = serializers.CharField()
    nonce = serializers.CharField()
    signature = serializers.CharField()
    ref = serializers.CharField(required=False, allow_blank=True)


class VerifyResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    wallet_address = serializers.CharField()
    referral_code = serializers.CharField()
    created = serializers.BooleanField()


class MeSerializer(serializers.Serializer):
    wallet_address = serializers.CharField()
    referral_code = serializers.CharField()
    joined_phase = serializers.CharField()
    referred_count = serializers.IntegerField()
    earned_vot = serializers.DecimalField(max_digits=20, decimal_places=4)
    milestone_100_reached_at = serializers.DateTimeField(allow_null=True)
    milestone_500_reached_at = serializers.DateTimeField(allow_null=True)
