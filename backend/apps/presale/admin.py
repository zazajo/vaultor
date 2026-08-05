from django.contrib import admin

from .models import LAMPORTS_PER_SOL, Contribution, PresaleConfig, Tier


@admin.register(PresaleConfig)
class PresaleConfigAdmin(admin.ModelAdmin):
    readonly_fields = ('last_indexed_signature', 'last_indexed_at',
                       'sol_usd_price', 'sol_usd_updated_at')

    fieldsets = (
        ('Chain', {
            'fields': ('treasury_address', 'cluster', 'rpc_url'),
        }),
        ('Caps and limits (lamports — 1 SOL = 1,000,000,000)', {
            'fields': (
                'soft_cap_lamports',
                'hard_cap_lamports',
                'min_contribution_lamports',
                'max_contribution_lamports',
                'token_price_lamports',
            ),
        }),
        ('Advertised pricing (display only — does not affect allocations)', {
            'fields': ('presale_price_usd', 'launch_price_usd', 'sol_usd_rate_at_pricing'),
            'description': 'These drive the copy on the incubator page. Allocations are '
                           'computed from token_price_lamports above, so changing a USD '
                           'price here does not retroactively change anyone\'s tokens.',
        }),
        ('Controls', {
            'fields': ('is_paused',),
        }),
        ('Indexer state', {
            'fields': ('last_indexed_signature', 'last_indexed_at',
                       'sol_usd_price', 'sol_usd_updated_at'),
        }),
    )

    def has_add_permission(self, request):
        # Singleton — the row is created on first load().
        return not PresaleConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Tier)
class TierAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_sol', 'bonus_bps', 'order')
    list_editable = ('bonus_bps', 'order')
    ordering = ('order',)

    @admin.display(description='Min (SOL)', ordering='min_lamports')
    def min_sol(self, obj):
        return f'{obj.min_lamports / LAMPORTS_PER_SOL:g}'


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ('signature_short', 'sender_address', 'sol_amount', 'tokens', 'status', 'block_time')
    list_filter = ('status',)
    search_fields = ('signature', 'sender_address', 'referral_code')
    ordering = ('-slot',)

    # Contributions mirror on-chain history, so they are not hand-editable —
    # the only intended change is flipping status to exclude or mark refunded.
    # base_tokens is frozen at credit time and editing it would silently rewrite
    # what someone earned.
    readonly_fields = ('signature', 'sender_address', 'lamports', 'slot', 'block_time',
                       'created_at', 'base_tokens', 'token_price_lamports_at_credit')

    def has_add_permission(self, request):
        return False

    @admin.display(description='Signature')
    def signature_short(self, obj):
        return f'{obj.signature[:16]}…'

    @admin.display(description='Amount (SOL)', ordering='lamports')
    def sol_amount(self, obj):
        return f'{obj.sol:g}'

    @admin.display(description='Tokens (frozen)', ordering='base_tokens')
    def tokens(self, obj):
        return f'{obj.base_tokens:,.2f}' if obj.base_tokens is not None else '—'
