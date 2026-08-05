from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

# Solana native SOL has 9 decimals. Every on-chain amount in this app is stored
# as an integer count of base units (lamports) — never a float — so that
# rounding can't silently lose or invent money.
LAMPORTS_PER_SOL = 1_000_000_000


class PresaleConfig(models.Model):
    """Financial and on-chain parameters for the raise.

    Presale *timing* stays on core.SiteConfig (presale_start / presale_open) so
    there is a single source of truth for the countdown; this model only owns
    the money and chain settings.
    """

    class Cluster(models.TextChoices):
        MAINNET = 'mainnet-beta', 'Mainnet Beta'
        DEVNET = 'devnet', 'Devnet'

    treasury_address = models.CharField(
        max_length=44,
        blank=True,
        help_text='Base58 Solana address that receives contributions. This is the '
                  'single canonical address shown on the site.',
    )
    cluster = models.CharField(max_length=20, choices=Cluster.choices, default=Cluster.MAINNET)
    rpc_url = models.URLField(
        blank=True,
        help_text='Solana RPC endpoint used by the indexer. Leave blank to use the '
                  'public endpoint for the selected cluster (rate limited).',
    )

    soft_cap_lamports = models.BigIntegerField(default=0, validators=[MinValueValidator(0)])
    hard_cap_lamports = models.BigIntegerField(default=0, validators=[MinValueValidator(0)])
    min_contribution_lamports = models.BigIntegerField(default=0, validators=[MinValueValidator(0)])
    max_contribution_lamports = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Per-address cap across all their contributions. 0 means no cap.',
    )

    token_price_lamports = models.BigIntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text='Price of one token, in lamports. This is the number that decides '
                  'allocations. 0 disables allocation math.',
    )

    # Display-only. Deliberately separate from token_price_lamports: allocations
    # must be reproducible from on-chain SOL amounts alone, so the figure that
    # decides who gets what cannot depend on a USD rate that moves after the
    # fact. These two are what the page advertises; the lamport price is what
    # the ledger honours.
    presale_price_usd = models.DecimalField(
        max_digits=12, decimal_places=6, null=True, blank=True,
        help_text='Advertised presale price per token in USD, e.g. 0.008.',
    )
    launch_price_usd = models.DecimalField(
        max_digits=12, decimal_places=6, null=True, blank=True,
        help_text='Advertised launch price per token in USD, e.g. 0.010.',
    )
    sol_usd_rate_at_pricing = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True,
        help_text='The SOL/USD rate token_price_lamports was derived from. Recorded '
                  'so the advertised USD price can be audited against the rate used.',
    )

    is_paused = models.BooleanField(
        default=False,
        help_text='Hides the contribution address on the site without touching timing.',
    )

    # Cursor for the indexer. Solana signature pagination walks backwards from
    # the newest signature, so this marks where the last successful pass stopped.
    last_indexed_signature = models.CharField(max_length=88, blank=True)
    last_indexed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Presale configuration'
        verbose_name_plural = 'Presale configuration'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    @property
    def effective_rpc_url(self):
        if self.rpc_url:
            return self.rpc_url
        return f'https://api.{self.cluster}.solana.com'

    def __str__(self):
        return 'Presale Configuration'


class Tier(models.Model):
    """Contribution bands that grant a bonus on top of the base allocation."""

    name = models.CharField(max_length=100)
    min_lamports = models.BigIntegerField(
        validators=[MinValueValidator(0)],
        help_text='Minimum cumulative contribution to qualify for this tier.',
    )
    bonus_bps = models.PositiveIntegerField(
        default=0,
        help_text='Bonus in basis points (100 bps = 1%%) applied to the token allocation.',
    )
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'min_lamports']

    def __str__(self):
        return f'{self.name} (>= {self.min_lamports / LAMPORTS_PER_SOL:g} SOL)'


class Contribution(models.Model):
    """A single confirmed SOL transfer into the treasury address.

    Rows are created by the indexer, keyed on the transaction signature so that
    re-running the indexer is idempotent and can never double-credit.
    """

    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Confirmed'
        REFUNDED = 'refunded', 'Refunded'
        EXCLUDED = 'excluded', 'Excluded'

    signature = models.CharField(max_length=88, unique=True, db_index=True)
    sender_address = models.CharField(max_length=44, db_index=True)
    lamports = models.BigIntegerField(validators=[MinValueValidator(0)])
    slot = models.BigIntegerField()
    block_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    referral_code = models.CharField(max_length=64, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-slot']
        indexes = [
            models.Index(fields=['status', '-slot']),
        ]

    @property
    def sol(self):
        return Decimal(self.lamports) / Decimal(LAMPORTS_PER_SOL)

    def __str__(self):
        return f'{self.sender_address[:8]}… — {self.sol:g} SOL'
