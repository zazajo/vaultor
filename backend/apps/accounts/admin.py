from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import AuthChallenge, Referral, User


class VaultorUserAdmin(UserAdmin):
    list_display = (
        'wallet_address', 'referral_code', 'joined_phase',
        'referred_count', 'milestone_100_reached_at', 'milestone_500_reached_at',
        'date_joined',
    )
    search_fields = ('wallet_address', 'referral_code')
    ordering = ('-date_joined',)
    # AbstractUser's own fieldsets reference username/password/permissions
    # fields that still exist but aren't meaningful here (no password) - kept
    # minimal rather than fighting UserAdmin's layout for a launch-week admin
    # view.
    fieldsets = (
        (None, {'fields': ('wallet_address', 'referral_code', 'joined_phase')}),
        ('Milestones', {'fields': ('milestone_100_reached_at', 'milestone_500_reached_at')}),
        ('Django', {'fields': ('username', 'is_staff', 'is_superuser', 'is_active')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets

    @admin.display(description='Referrals')
    def referred_count(self, obj):
        return obj.referrals_made.count()


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referrer', 'referred_user', 'phase_at_referral', 'created_at')
    list_filter = ('phase_at_referral',)
    search_fields = ('referrer__wallet_address', 'referred_user__wallet_address')
    readonly_fields = ('referrer', 'referred_user', 'phase_at_referral', 'created_at')

    def has_add_permission(self, request):
        return False


@admin.register(AuthChallenge)
class AuthChallengeAdmin(admin.ModelAdmin):
    list_display = ('wallet_address', 'issued_at', 'expires_at', 'consumed_at')
    search_fields = ('wallet_address',)
    readonly_fields = ('wallet_address', 'nonce', 'issued_at', 'expires_at', 'consumed_at')

    def has_add_permission(self, request):
        return False


admin.site.register(User, VaultorUserAdmin)
