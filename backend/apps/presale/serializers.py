from rest_framework import serializers

from .models import Tier

# Lamport counts can exceed JavaScript's safe integer range, so every base-unit
# amount crosses the wire as a decimal string and is parsed with BigInt on the
# client rather than as a JSON number.


class TierSerializer(serializers.ModelSerializer):
    min_lamports = serializers.CharField()

    class Meta:
        model = Tier
        fields = ['id', 'name', 'min_lamports', 'bonus_bps', 'description', 'order']


class PresaleStatusSerializer(serializers.Serializer):
    treasury_address = serializers.CharField()
    cluster = serializers.CharField()
    is_paused = serializers.BooleanField()

    soft_cap_lamports = serializers.CharField()
    hard_cap_lamports = serializers.CharField()
    min_contribution_lamports = serializers.CharField()
    max_contribution_lamports = serializers.CharField()
    token_price_lamports = serializers.CharField()
    presale_price_usd = serializers.DecimalField(max_digits=12, decimal_places=6, allow_null=True)
    launch_price_usd = serializers.DecimalField(max_digits=12, decimal_places=6, allow_null=True)

    raised_lamports = serializers.CharField()
    contributor_count = serializers.IntegerField()

    tiers = TierSerializer(many=True)
    last_indexed_at = serializers.DateTimeField(allow_null=True)


class AllocationSerializer(serializers.Serializer):
    address = serializers.CharField()
    contributed_lamports = serializers.CharField()
    tier = TierSerializer(allow_null=True)
    bonus_bps = serializers.IntegerField()
    base_tokens = serializers.DecimalField(max_digits=40, decimal_places=9, allow_null=True)
    bonus_tokens = serializers.DecimalField(max_digits=40, decimal_places=9, allow_null=True)
    total_tokens = serializers.DecimalField(max_digits=40, decimal_places=9, allow_null=True)
    contribution_count = serializers.IntegerField()
