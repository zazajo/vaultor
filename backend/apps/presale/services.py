"""Allocation math for the presale.

Contribution *totals* are always derived from Contribution rows rather than
stored, so the raised figure can never drift from what actually landed on chain.

Token counts work the other way round: each contribution's base token amount is
frozen at credit time. Deriving them from the current price would mean every
existing contributor's allocation silently re-priced whenever the token price
changed, which would be indistinguishable from the site misreporting what people
already own. Tier bonuses are still applied live against the running total, so a
top-up can still promote someone a tier.
"""
from decimal import Decimal

from django.db.models import Sum

from .models import Contribution, PresaleConfig, Tier

BPS_DENOMINATOR = Decimal(10_000)


def total_raised_lamports():
    """Sum of every confirmed contribution."""
    agg = Contribution.objects.filter(
        status=Contribution.Status.CONFIRMED,
    ).aggregate(total=Sum('lamports'))
    return agg['total'] or 0


def contributor_count():
    return Contribution.objects.filter(
        status=Contribution.Status.CONFIRMED,
    ).values('sender_address').distinct().count()


def contributed_lamports_for(address):
    agg = Contribution.objects.filter(
        sender_address=address,
        status=Contribution.Status.CONFIRMED,
    ).aggregate(total=Sum('lamports'))
    return agg['total'] or 0


def base_tokens_for(address):
    """Sum of the token amounts frozen on each of this address's contributions.

    Returns None when no contribution has a price recorded, which is how an
    unconfigured presale is distinguished from a genuine zero.
    """
    rows = Contribution.objects.filter(
        sender_address=address,
        status=Contribution.Status.CONFIRMED,
    ).exclude(base_tokens=None).aggregate(total=Sum('base_tokens'))
    return rows['total']


def tier_for_lamports(lamports, tiers=None):
    """Highest tier whose threshold the contribution meets, or None."""
    if tiers is None:
        tiers = Tier.objects.all()
    qualifying = [t for t in tiers if lamports >= t.min_lamports]
    if not qualifying:
        return None
    return max(qualifying, key=lambda t: t.min_lamports)


def quote_base_tokens(lamports, token_price_lamports):
    """Tokens a contribution of this size earns at this price, before bonus.

    Used by the indexer to freeze an amount at credit time, and by the page to
    quote a prospective contribution. A price of 0 means pricing is not
    configured, which is reported as None rather than a misleading zero.
    """
    if not token_price_lamports:
        return None
    return Decimal(lamports) / Decimal(token_price_lamports)


def allocation_for_address(address, tiers=None):
    """Current allocation for an address, from frozen token amounts.

    The tier is resolved against the running total, so contributing more can
    still move someone up a band; only the price is frozen.
    """
    contributed = contributed_lamports_for(address)
    tier = tier_for_lamports(contributed, tiers=tiers)
    bonus_bps = tier.bonus_bps if tier else 0

    base_tokens = base_tokens_for(address)
    if base_tokens is None:
        return {
            'contributed_lamports': contributed,
            'tier': tier,
            'bonus_bps': bonus_bps,
            'base_tokens': None,
            'bonus_tokens': None,
            'total_tokens': None,
        }

    bonus_tokens = base_tokens * Decimal(bonus_bps) / BPS_DENOMINATOR
    return {
        'contributed_lamports': contributed,
        'tier': tier,
        'bonus_bps': bonus_bps,
        'base_tokens': base_tokens,
        'bonus_tokens': bonus_tokens,
        'total_tokens': base_tokens + bonus_tokens,
    }


def quote_allocation(lamports, config=None, tiers=None):
    """What a prospective contribution of this size would earn right now.

    Unlike allocation_for_address this uses the *current* price, because it is
    a forward-looking quote rather than a record of something already credited.
    """
    if config is None:
        config = PresaleConfig.load()

    tier = tier_for_lamports(lamports, tiers=tiers)
    bonus_bps = tier.bonus_bps if tier else 0
    base_tokens = quote_base_tokens(lamports, config.token_price_lamports)

    if base_tokens is None:
        return {'tier': tier, 'bonus_bps': bonus_bps, 'base_tokens': None,
                'bonus_tokens': None, 'total_tokens': None}

    bonus_tokens = base_tokens * Decimal(bonus_bps) / BPS_DENOMINATOR
    return {
        'tier': tier,
        'bonus_bps': bonus_bps,
        'base_tokens': base_tokens,
        'bonus_tokens': bonus_tokens,
        'total_tokens': base_tokens + bonus_tokens,
    }
