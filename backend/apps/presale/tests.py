from decimal import Decimal

from django.test import TestCase, override_settings
from django.urls import reverse

from apps.presale.management.commands.index_contributions import extract_deposit
from apps.presale.models import LAMPORTS_PER_SOL, Contribution, PresaleConfig, Tier
from apps.presale import services

TREASURY = 'Treasury11111111111111111111111111111111111'
CONTRIBUTOR = 'Contrib11111111111111111111111111111111111'


def build_tx(keys, pre, post, err=None, slot=100, block_time=1_700_000_000):
    return {
        'slot': slot,
        'blockTime': block_time,
        'meta': {'err': err, 'preBalances': pre, 'postBalances': post},
        'transaction': {'message': {'accountKeys': keys}},
    }


class ExtractDepositTests(TestCase):
    """The indexer decides who gets credited, so these cases are the guardrail."""

    def test_credits_balance_delta_to_fee_payer(self):
        tx = build_tx([CONTRIBUTOR, TREASURY], pre=[5 * 10**9, 0], post=[3 * 10**9, 2 * 10**9])
        self.assertEqual(extract_deposit(tx, TREASURY), (2 * 10**9, CONTRIBUTOR))

    def test_ignores_failed_transaction(self):
        tx = build_tx(
            [CONTRIBUTOR, TREASURY],
            pre=[5 * 10**9, 0],
            post=[3 * 10**9, 2 * 10**9],
            err={'InstructionError': [0, 'Custom']},
        )
        self.assertIsNone(extract_deposit(tx, TREASURY))

    def test_ignores_outgoing_transfer(self):
        tx = build_tx([TREASURY, CONTRIBUTOR], pre=[5 * 10**9, 0], post=[3 * 10**9, 2 * 10**9])
        self.assertIsNone(extract_deposit(tx, TREASURY))

    def test_ignores_transaction_not_touching_treasury(self):
        tx = build_tx([CONTRIBUTOR, 'Other1111111111111111111111111111111111111'],
                      pre=[5 * 10**9, 0], post=[3 * 10**9, 2 * 10**9])
        self.assertIsNone(extract_deposit(tx, TREASURY))

    def test_handles_json_parsed_account_key_dicts(self):
        keys = [{'pubkey': CONTRIBUTOR}, {'pubkey': TREASURY}]
        tx = build_tx(keys, pre=[5 * 10**9, 0], post=[4 * 10**9, 1 * 10**9])
        self.assertEqual(extract_deposit(tx, TREASURY), (1 * 10**9, CONTRIBUTOR))

    def test_sums_multiple_transfers_via_balance_delta(self):
        # Two transfers in one transaction land as a single net delta.
        tx = build_tx([CONTRIBUTOR, TREASURY], pre=[10 * 10**9, 0], post=[6 * 10**9, 4 * 10**9])
        self.assertEqual(extract_deposit(tx, TREASURY), (4 * 10**9, CONTRIBUTOR))


class AllocationTests(TestCase):
    def setUp(self):
        config = PresaleConfig.load()
        config.treasury_address = TREASURY
        # 0.001 SOL per token.
        config.token_price_lamports = 1_000_000
        config.save()

        Tier.objects.create(name='Base', min_lamports=0, bonus_bps=0, order=0)
        Tier.objects.create(name='Silver', min_lamports=10 * LAMPORTS_PER_SOL, bonus_bps=500, order=1)
        Tier.objects.create(name='Gold', min_lamports=50 * LAMPORTS_PER_SOL, bonus_bps=1500, order=2)

    def test_picks_highest_qualifying_tier(self):
        self.assertEqual(services.tier_for_lamports(60 * LAMPORTS_PER_SOL).name, 'Gold')
        self.assertEqual(services.tier_for_lamports(10 * LAMPORTS_PER_SOL).name, 'Silver')
        self.assertEqual(services.tier_for_lamports(1 * LAMPORTS_PER_SOL).name, 'Base')

    def test_bonus_applied_on_top_of_base(self):
        result = services.allocation_for_lamports(50 * LAMPORTS_PER_SOL)
        # 50 SOL / 0.001 = 50,000 tokens, +15% = 57,500
        self.assertEqual(result['base_tokens'], Decimal(50_000))
        self.assertEqual(result['total_tokens'], Decimal(57_500))

    def test_unconfigured_price_returns_none_not_zero(self):
        config = PresaleConfig.load()
        config.token_price_lamports = 0
        config.save()
        result = services.allocation_for_lamports(10 * LAMPORTS_PER_SOL)
        self.assertIsNone(result['total_tokens'])

    def test_totals_only_count_confirmed_contributions(self):
        Contribution.objects.create(
            signature='sig-confirmed', sender_address=CONTRIBUTOR,
            lamports=5 * LAMPORTS_PER_SOL, slot=1,
        )
        Contribution.objects.create(
            signature='sig-refunded', sender_address=CONTRIBUTOR,
            lamports=99 * LAMPORTS_PER_SOL, slot=2,
            status=Contribution.Status.REFUNDED,
        )
        self.assertEqual(services.total_raised_lamports(), 5 * LAMPORTS_PER_SOL)
        self.assertEqual(services.contributed_lamports_for(CONTRIBUTOR), 5 * LAMPORTS_PER_SOL)

    def test_contributor_count_deduplicates_addresses(self):
        for i in range(3):
            Contribution.objects.create(
                signature=f'sig-{i}', sender_address=CONTRIBUTOR,
                lamports=LAMPORTS_PER_SOL, slot=i,
            )
        self.assertEqual(services.contributor_count(), 1)


# settings.py turns on SECURE_SSL_REDIRECT whenever DEBUG is False, and Django
# forces DEBUG=False under test — so the test client's plain-HTTP requests get
# 301'd before they ever reach a view.
@override_settings(SECURE_SSL_REDIRECT=False)
class PresaleApiTests(TestCase):
    def setUp(self):
        config = PresaleConfig.load()
        config.treasury_address = TREASURY
        config.hard_cap_lamports = 1000 * LAMPORTS_PER_SOL
        config.save()

    def test_status_returns_amounts_as_strings(self):
        Contribution.objects.create(
            signature='sig-a', sender_address=CONTRIBUTOR,
            lamports=3 * LAMPORTS_PER_SOL, slot=1,
        )
        response = self.client.get(reverse('presale-status'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['raised_lamports'], str(3 * LAMPORTS_PER_SOL))
        self.assertIsInstance(response.data['raised_lamports'], str)
        self.assertEqual(response.data['treasury_address'], TREASURY)

    def test_paused_presale_withholds_treasury_address(self):
        config = PresaleConfig.load()
        config.is_paused = True
        config.save()
        response = self.client.get(reverse('presale-status'))
        self.assertEqual(response.data['treasury_address'], '')
        self.assertTrue(response.data['is_paused'])

    def test_allocation_requires_address(self):
        self.assertEqual(self.client.get(reverse('presale-allocation')).status_code, 400)

    def test_allocation_rejects_malformed_address(self):
        response = self.client.get(reverse('presale-allocation'), {'address': 'nope'})
        self.assertEqual(response.status_code, 400)

    def test_allocation_for_known_address(self):
        Contribution.objects.create(
            signature='sig-b', sender_address=CONTRIBUTOR,
            lamports=7 * LAMPORTS_PER_SOL, slot=1,
        )
        response = self.client.get(reverse('presale-allocation'), {'address': CONTRIBUTOR})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['contributed_lamports'], str(7 * LAMPORTS_PER_SOL))
        self.assertEqual(response.data['contribution_count'], 1)
