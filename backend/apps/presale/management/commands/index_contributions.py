"""Index confirmed SOL transfers into the treasury address.

Design notes, since this is the code that decides who gets credited:

* Only `finalized` transactions are read. Confirmed-but-not-finalized slots can
  still be rolled back, and crediting a contribution that later disappears is
  worse than crediting it a few seconds late.
* Amounts come from the treasury's pre/post balance delta, not from parsing
  transfer instructions. That correctly captures SOL arriving via CPI, via
  multiple transfers in one transaction, or from programs we don't recognise.
* Transactions where `meta.err` is set are skipped — a failed transaction still
  gets a signature and would otherwise look like a contribution.
* Rows are keyed on the transaction signature with a unique constraint, so a
  re-run (or two overlapping runs) can never double-credit an address.
"""
from datetime import datetime, timezone
from decimal import Decimal

import requests
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction as db_transaction
from django.utils import timezone as dj_timezone

from apps.presale.models import Contribution, PresaleConfig
from apps.presale.services import quote_base_tokens

# Solana's getSignaturesForAddress caps out at 1000 per call.
SIGNATURE_PAGE_SIZE = 1000
REQUEST_TIMEOUT = 30

# Display-only SOL price. Refreshed here rather than during a web request so a
# slow or rate-limited price API can never hang the incubator page.
PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
PRICE_TIMEOUT = 10


class RpcError(Exception):
    pass


def rpc_call(url, method, params):
    response = requests.post(
        url,
        json={'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params},
        timeout=REQUEST_TIMEOUT,
        headers={'Content-Type': 'application/json'},
    )
    response.raise_for_status()
    body = response.json()
    if 'error' in body:
        raise RpcError(f'{method} failed: {body["error"]}')
    return body.get('result')


def fetch_new_signatures(url, address, until_signature):
    """Signatures newer than `until_signature`, oldest first.

    The RPC returns newest-first and pages backwards via `before`, so results
    are collected in that order and reversed once at the end. Processing oldest
    first means an interrupted run leaves the cursor on a contiguous prefix
    rather than a hole.
    """
    collected = []
    before = None

    while True:
        params = {'limit': SIGNATURE_PAGE_SIZE, 'commitment': 'finalized'}
        if before:
            params['before'] = before
        if until_signature:
            params['until'] = until_signature

        page = rpc_call(url, 'getSignaturesForAddress', [address, params])
        if not page:
            break

        collected.extend(page)

        if len(page) < SIGNATURE_PAGE_SIZE:
            break
        before = page[-1]['signature']

    collected.reverse()
    return collected


def extract_deposit(tx, treasury_address):
    """Lamports credited to the treasury by this transaction, and the payer.

    Returns (lamports, sender) or None when the transaction is not a deposit.
    """
    meta = tx.get('meta') or {}
    if meta.get('err') is not None:
        return None

    message = (tx.get('transaction') or {}).get('message') or {}
    account_keys = message.get('accountKeys') or []

    # jsonParsed encoding returns dicts; base64/json returns bare strings.
    keys = [k['pubkey'] if isinstance(k, dict) else k for k in account_keys]

    if treasury_address not in keys:
        return None

    index = keys.index(treasury_address)
    pre = meta.get('preBalances') or []
    post = meta.get('postBalances') or []
    if index >= len(pre) or index >= len(post):
        return None

    delta = post[index] - pre[index]
    if delta <= 0:
        return None

    # The fee payer is always the first account and is who we credit. A transfer
    # routed through a program would attribute to the signer that paid for it,
    # which is the account the contributor actually controls.
    sender = keys[0] if keys else ''

    # Self-transfers (treasury paying its own fees, or moving funds internally)
    # are not contributions.
    if sender == treasury_address:
        return None

    return delta, sender


class Command(BaseCommand):
    help = 'Index SOL contributions sent to the configured treasury address.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--full',
            action='store_true',
            help='Ignore the stored cursor and re-scan the full address history. '
                 'Safe to run — existing signatures are skipped, not duplicated.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would be credited without writing any rows.',
        )
        parser.add_argument(
            '--bootstrap',
            action='store_true',
            help='Move the cursor to the newest current transaction WITHOUT crediting '
                 'anything, so indexing starts from now. Run this once immediately '
                 'before the presale opens on a treasury that has prior history, '
                 'otherwise old incoming transfers are credited as contributions.',
        )

    def handle(self, *args, **options):
        config = PresaleConfig.load()

        if not config.treasury_address:
            raise CommandError(
                'No treasury_address configured. Set it in the admin under '
                'Presale configuration before running the indexer.'
            )

        url = config.effective_rpc_url
        until = '' if options['full'] else config.last_indexed_signature
        dry_run = options['dry_run']

        if options['bootstrap']:
            self._bootstrap(config, url, dry_run)
            return

        self.stdout.write(f'Indexing {config.treasury_address} on {config.cluster}')
        if until:
            self.stdout.write(f'Resuming after {until[:16]}…')

        try:
            signatures = fetch_new_signatures(url, config.treasury_address, until)
        except (requests.RequestException, RpcError) as exc:
            raise CommandError(f'Could not fetch signatures: {exc}') from exc

        self._refresh_sol_price(dry_run)

        if not signatures:
            self.stdout.write(self.style.SUCCESS('No new transactions.'))
            self._touch_indexed_at(config, dry_run)
            return

        self.stdout.write(f'{len(signatures)} new transaction(s) to inspect.')

        credited = 0
        skipped = 0
        total_lamports = 0
        newest_signature = None

        for entry in signatures:
            signature = entry['signature']

            if entry.get('err') is not None:
                skipped += 1
                newest_signature = signature
                continue

            if Contribution.objects.filter(signature=signature).exists():
                newest_signature = signature
                continue

            try:
                tx = rpc_call(url, 'getTransaction', [
                    signature,
                    {
                        'encoding': 'jsonParsed',
                        'commitment': 'finalized',
                        'maxSupportedTransactionVersion': 0,
                    },
                ])
            except (requests.RequestException, RpcError) as exc:
                # Stop rather than skip: advancing the cursor past a transaction
                # we failed to read would silently drop a contribution.
                self.stderr.write(self.style.ERROR(f'Failed to fetch {signature[:16]}…: {exc}'))
                break

            if tx is None:
                self.stderr.write(self.style.WARNING(f'{signature[:16]}… unavailable (pruned); stopping.'))
                break

            deposit = extract_deposit(tx, config.treasury_address)
            if deposit is None:
                skipped += 1
                newest_signature = signature
                continue

            lamports, sender = deposit
            block_time = None
            if tx.get('blockTime'):
                block_time = datetime.fromtimestamp(tx['blockTime'], tz=timezone.utc)

            # Freeze the price now. Re-reading it later would let a price change
            # silently restate what this contributor already earned.
            price = config.token_price_lamports
            base_tokens = quote_base_tokens(lamports, price)

            if dry_run:
                earned = f'{base_tokens:,.2f} tokens' if base_tokens is not None else 'no price set'
                self.stdout.write(f'  would credit {sender[:8]}... {lamports / 1e9:g} SOL -> {earned}')
            else:
                try:
                    Contribution.objects.create(
                        signature=signature,
                        sender_address=sender,
                        lamports=lamports,
                        slot=tx.get('slot') or entry.get('slot') or 0,
                        block_time=block_time,
                        base_tokens=base_tokens,
                        token_price_lamports_at_credit=price,
                    )
                except IntegrityError:
                    # Another indexer run inserted it between the check and here.
                    newest_signature = signature
                    continue

            credited += 1
            total_lamports += lamports
            newest_signature = signature

        if not dry_run and newest_signature:
            with db_transaction.atomic():
                fresh = PresaleConfig.load()
                fresh.last_indexed_signature = newest_signature
                fresh.last_indexed_at = dj_timezone.now()
                fresh.save()

        summary = (
            f'Credited {credited} contribution(s) totalling {total_lamports / 1e9:g} SOL; '
            f'{skipped} non-deposit transaction(s) skipped.'
        )
        self.stdout.write(self.style.SUCCESS(f'[dry run] {summary}' if dry_run else summary))

    def _refresh_sol_price(self, dry_run):
        """Update the cached SOL/USD figure shown on the page.

        Best-effort by design: a failure here must never abort an indexing run,
        because crediting contributions matters and a display price does not.
        The last known value simply stays in place.
        """
        if dry_run:
            return
        try:
            response = requests.get(PRICE_URL, timeout=PRICE_TIMEOUT)
            response.raise_for_status()
            price = Decimal(str(response.json()['solana']['usd']))
        except (requests.RequestException, KeyError, ValueError, ArithmeticError) as exc:
            self.stderr.write(self.style.WARNING(f'SOL price refresh skipped: {exc}'))
            return

        with db_transaction.atomic():
            fresh = PresaleConfig.load()
            fresh.sol_usd_price = price
            fresh.sol_usd_updated_at = dj_timezone.now()
            fresh.save()
        self.stdout.write(f'SOL price updated: ${price}')

    def _bootstrap(self, config, url, dry_run):
        """Skip everything that already happened and start counting from now.

        A treasury reused from another purpose carries history, and every past
        incoming transfer would otherwise be credited to a sender who never
        took part in the presale.
        """
        try:
            page = rpc_call(url, 'getSignaturesForAddress', [
                config.treasury_address,
                {'limit': 1, 'commitment': 'finalized'},
            ])
        except (requests.RequestException, RpcError) as exc:
            raise CommandError(f'Could not fetch signatures: {exc}') from exc

        if not page:
            self.stdout.write('No transaction history — nothing to skip.')
            return

        newest = page[0]['signature']
        existing = Contribution.objects.count()

        if dry_run:
            self.stdout.write(f'[dry run] would set cursor to {newest[:16]}…')
            return

        with db_transaction.atomic():
            fresh = PresaleConfig.load()
            fresh.last_indexed_signature = newest
            fresh.last_indexed_at = dj_timezone.now()
            fresh.save()

        self.stdout.write(self.style.SUCCESS(f'Cursor set to {newest[:16]}…'))
        self.stdout.write('Only transactions after this point will be credited.')
        if existing:
            self.stdout.write(self.style.WARNING(
                f'Note: {existing} contribution row(s) already exist and were not removed.'
            ))

    def _touch_indexed_at(self, config, dry_run):
        if dry_run:
            return
        config.last_indexed_at = dj_timezone.now()
        config.save()
