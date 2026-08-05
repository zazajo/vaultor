"""Allocation math for the presale.

Allocations are always derived from confirmed Contribution rows rather than
stored, so there is no second copy of the numbers that can drift out of sync
with what actually landed on chain.
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


def tier_for_lamports(lamports, tiers=None):
    """Highest tier whose threshold the contribution meets, or None."""
    if tiers is None:
        tiers = Tier.objects.all()
    qualifying = [t for t in tiers if lamports >= t.min_lamports]
    if not qualifying:
        return None
    return max(qualifying, key=lambda t: t.min_lamports)


def allocation_for_lamports(lamports, config=None, tiers=None):
    """Token allocation for a given contribution size.

    Returns a dict of Decimals. A token price of 0 means allocation math is not
    configured yet, in which case the token amounts come back as None rather
    than a misleading zero.
    """
    if config is None:
        config = PresaleConfig.load()

    tier = tier_for_lamports(lamports, tiers=tiers)
    bonus_bps = tier.bonus_bps if tier else 0

    if not config.token_price_lamports:
        return {
            'tier': tier,
            'bonus_bps': bonus_bps,
            'base_tokens': None,
            'bonus_tokens': None,
            'total_tokens': None,
        }

    base_tokens = Decimal(lamports) / Decimal(config.token_price_lamports)
    bonus_tokens = base_tokens * Decimal(bonus_bps) / BPS_DENOMINATOR

    return {
        'tier': tier,
        'bonus_bps': bonus_bps,
        'base_tokens': base_tokens,
        'bonus_tokens': bonus_tokens,
        'total_tokens': base_tokens + bonus_tokens,
    }
