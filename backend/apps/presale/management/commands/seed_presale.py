"""Apply the agreed presale configuration and tier bands.

Written because the production database starts empty: every value entered in a
local admin lives only in the local sqlite file, and re-typing lamport figures
into a production form is exactly the kind of task where a dropped zero costs
real money. The numbers below are the reviewed ones; this command is the only
thing that should be putting them into a database.

Deliberately narrow in what it touches:

* The indexer cursor, credited contributions and `is_paused` are never written.
  Seeding must not resurrect already-indexed history, and must not un-pause a
  presale someone paused on purpose.
* `presale_open` is never flipped. Opening the raise is a decision, not a
  side effect of running a config command.
* Tiers are matched by name and updated in place, so a re-run cannot duplicate
  a band. A tier in the database that this file doesn't know about is reported
  rather than deleted — it changes allocations, so it needs a human decision.
"""
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction as db_transaction
from django.utils import timezone as dj_timezone
from django.utils.dateparse import parse_datetime

from apps.core.models import SiteConfig
from apps.presale.models import LAMPORTS_PER_SOL, Contribution, PresaleConfig, Tier

# Priced at $0.008/token against SOL at $74.11 (see commit 21a4789):
#   $74.11 / $0.008 = 9,263.75 tokens per SOL
#   1e9 lamports / 9,263.75 = 107,947 lamports per token
# token_price_lamports is the number that decides allocations. The USD figures
# below are advertising copy and never enter the math.
CONFIG = {
    'treasury_address': '5oQX6kdkKutvUNP7qGvBb8nn89oJMLVMeDWMyov9PXgq',
    'cluster': PresaleConfig.Cluster.MAINNET,
    'soft_cap_lamports': 160 * LAMPORTS_PER_SOL,
    'hard_cap_lamports': 300 * LAMPORTS_PER_SOL,
    'min_contribution_lamports': LAMPORTS_PER_SOL // 4,
    'max_contribution_lamports': 10 * LAMPORTS_PER_SOL,
    'token_price_lamports': 107_947,
    'presale_price_usd': Decimal('0.008'),
    'launch_price_usd': Decimal('0.010'),
    'sol_usd_rate_at_pricing': Decimal('74.11'),
}

TIERS = [
    {
        'name': 'Observer',
        'min_lamports': 0,
        'bonus_bps': 0,
        'description': 'Entry tier. Base allocation, no bonus.',
        'order': 0,
    },
    {
        'name': 'Analyst',
        'min_lamports': 2 * LAMPORTS_PER_SOL,
        'bonus_bps': 500,
        'description': '5% bonus allocation on your full contribution.',
        'order': 1,
    },
    {
        'name': 'Oracle',
        'min_lamports': 5 * LAMPORTS_PER_SOL,
        'bonus_bps': 1500,
        'description': '15% bonus allocation plus priority access at launch.',
        'order': 2,
    },
]

# Fields worth showing in SOL rather than raw lamports when reporting a change —
# 160000000000 and 16000000000 are hard to tell apart at a glance, which is the
# error this command exists to prevent.
SOL_FIELDS = {
    'soft_cap_lamports',
    'hard_cap_lamports',
    'min_contribution_lamports',
    'max_contribution_lamports',
}


def render(field, value):
    if field in SOL_FIELDS:
        return f'{value / LAMPORTS_PER_SOL:g} SOL ({value:,})'
    if field == 'token_price_lamports':
        per_sol = LAMPORTS_PER_SOL / value if value else 0
        return f'{value:,} lamports/token ({per_sol:,.2f} tokens per SOL)'
    return str(value)


class Command(BaseCommand):
    help = 'Apply the reviewed presale configuration and tier bands to this database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would change without writing anything.',
        )
        parser.add_argument(
            '--rpc-url',
            default=None,
            help='Solana RPC endpoint for the indexer. Strongly recommended in '
                 'production: the default public endpoint is rate limited and will '
                 'throttle an indexing run during a busy raise.',
        )
        parser.add_argument(
            '--presale-start',
            default=None,
            help='ISO 8601 datetime for the countdown, e.g. 2026-08-09T16:00:00Z. '
                 'Sets core.SiteConfig.presale_start. Left alone when omitted.',
        )
        parser.add_argument(
            '--prune-tiers',
            action='store_true',
            help='Delete tier rows not defined in this file. Off by default, since '
                 'an unexpected tier may have been added deliberately.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        prefix = '[dry run] ' if dry_run else ''

        start = self._parse_start(options['presale_start'])

        config = PresaleConfig.load()
        desired = dict(CONFIG)
        if options['rpc_url'] is not None:
            desired['rpc_url'] = options['rpc_url']

        changes = [
            (field, getattr(config, field), value)
            for field, value in desired.items()
            if getattr(config, field) != value
        ]

        self._warn_on_reprice(config, desired)

        if changes:
            self.stdout.write(self.style.MIGRATE_HEADING(f'{prefix}Presale configuration'))
            for field, old, new in changes:
                self.stdout.write(f'  {field}:')
                self.stdout.write(f'    from {render(field, old)}')
                self.stdout.write(f'    to   {render(field, new)}')
        else:
            self.stdout.write('Presale configuration already matches.')

        tier_plan = self._plan_tiers(prefix)

        if dry_run:
            self.stdout.write(self.style.SUCCESS('\n[dry run] nothing written.'))
            return

        with db_transaction.atomic():
            for field, _, value in changes:
                setattr(config, field, value)
            if changes:
                config.save()
            self._apply_tiers(tier_plan, prune=options['prune_tiers'])
            if start is not None:
                self._apply_start(start)

        self.stdout.write(self.style.SUCCESS('\nConfiguration applied.'))
        self._report_remaining_steps()

    def _parse_start(self, raw):
        """Validate the timing argument before anything is written."""
        if raw is None:
            return None
        parsed = parse_datetime(raw)
        if parsed is None:
            raise CommandError(
                f'Could not parse --presale-start {raw!r}. Expected ISO 8601, '
                'e.g. 2026-08-09T16:00:00Z.'
            )
        if dj_timezone.is_naive(parsed):
            raise CommandError(
                '--presale-start has no timezone. Give it explicitly (…Z for UTC) '
                'rather than letting the server’s timezone decide when the raise opens.'
            )
        return parsed

    def _warn_on_reprice(self, config, desired):
        """A price change after crediting has begun is legal but worth stating."""
        new_price = desired['token_price_lamports']
        if config.token_price_lamports in (0, new_price):
            return
        credited = Contribution.objects.count()
        if not credited:
            return
        self.stderr.write(self.style.WARNING(
            f'Note: {credited} contribution(s) already credited at '
            f'{config.token_price_lamports:,} lamports/token. Their allocations are '
            f'frozen and will not change; only later contributions use the new price.'
        ))

    def _plan_tiers(self, prefix):
        existing = {t.name: t for t in Tier.objects.all()}
        plan = {'create': [], 'update': [], 'unknown': []}

        for spec in TIERS:
            current = existing.get(spec['name'])
            if current is None:
                plan['create'].append(spec)
                continue
            diff = {f: v for f, v in spec.items() if getattr(current, f) != v}
            if diff:
                plan['update'].append((current, spec, diff))

        known = {spec['name'] for spec in TIERS}
        plan['unknown'] = [t for name, t in existing.items() if name not in known]

        if any(plan.values()):
            self.stdout.write(self.style.MIGRATE_HEADING(f'\n{prefix}Tiers'))
        for spec in plan['create']:
            self.stdout.write(
                f'  create {spec["name"]} — >= {spec["min_lamports"] / LAMPORTS_PER_SOL:g} SOL, '
                f'+{spec["bonus_bps"] / 100:g}%'
            )
        for current, _, diff in plan['update']:
            fields = ', '.join(f'{f} {getattr(current, f)} → {v}' for f, v in diff.items())
            self.stdout.write(f'  update {current.name} — {fields}')
        for tier in plan['unknown']:
            self.stderr.write(self.style.WARNING(
                f'  unexpected tier in database: {tier.name} '
                f'(>= {tier.min_lamports / LAMPORTS_PER_SOL:g} SOL, +{tier.bonus_bps / 100:g}%). '
                f'It affects allocations — remove it with --prune-tiers or keep it deliberately.'
            ))
        if not any(plan.values()):
            self.stdout.write('Tiers already match.')
        return plan

    def _apply_tiers(self, plan, prune):
        for spec in plan['create']:
            Tier.objects.create(**spec)
        for current, spec, _ in plan['update']:
            for field, value in spec.items():
                setattr(current, field, value)
            current.save()
        if prune:
            for tier in plan['unknown']:
                self.stdout.write(self.style.WARNING(f'  deleting tier {tier.name}'))
                tier.delete()

    def _apply_start(self, start):
        site = SiteConfig.load()
        previous = site.presale_start
        site.presale_start = start
        site.save()
        self.stdout.write(f'\npresale_start: {previous} → {start}')

    def _report_remaining_steps(self):
        """State what this command deliberately did not do."""
        site = SiteConfig.load()
        now = dj_timezone.now()

        self.stdout.write('\nStill to do, by hand:')
        if site.presale_start is None:
            self.stderr.write(self.style.WARNING(
                '  ! presale_start is not set — the countdown has no target. '
                'Pass --presale-start.'
            ))
        elif site.presale_start < now:
            self.stderr.write(self.style.WARNING(
                f'  ! presale_start is in the past ({site.presale_start}). '
                'Pass --presale-start with the real opening time.'
            ))
        self.stdout.write(
            '  - Run `index_contributions --bootstrap` once, immediately before opening, '
            'so prior treasury history is not credited as contributions.'
        )
        self.stdout.write(
            '  - Schedule `index_contributions` to run on a repeating basis. Nothing '
            'credits contributions without it, and the raise total stays at zero.'
        )
        self.stdout.write(
            f'  - Set presale_open = True in the admin to open the raise. It is '
            f'currently {site.presale_open}; the API withholds the treasury address '
            f'until it is True.'
        )
