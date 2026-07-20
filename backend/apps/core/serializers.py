from rest_framework import serializers

from .models import SiteConfig


class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['presale_start', 'current_phase', 'presale_open', 'social_links']
