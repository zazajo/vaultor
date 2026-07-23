"""Seed the database with Vaultor's finalized site content.

Idempotent: every record is keyed by a natural identifier (slug / question)
and upserted via update_or_create, so running this command repeatedly - on a
fresh database, in disaster recovery, or against a new staging environment -
always converges to the same state instead of piling up duplicates.
"""
import shutil
from datetime import datetime, timezone as dt_timezone
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.core.models import SiteConfig
from apps.faq.models import FAQItem
from apps.roadmap.models import Phase
from apps.updates.models import Post

SEED_MEDIA_DIR = Path(__file__).resolve().parents[3] / 'updates' / 'fixtures' / 'seed_media'

SITE_CONFIG = {
    'presale_start': datetime(2026, 7, 28, 16, 0, 0, tzinfo=dt_timezone.utc),
    'current_phase': Phase.Slug.V0,
    'presale_open': False,
    'social_links': {
        'x': 'https://x.com/vaultor',
        'telegram': 'https://t.me/vaultor',
        'discord': 'https://discord.gg/vaultor',
        'reddit': 'https://www.reddit.com/r/vaultor',
    },
}

PHASES = [
    {
        'slug': Phase.Slug.V0,
        'title': 'V0 - Genesis',
        'description': 'The beginning. Community, referral program, and presale. The groundwork of the Vault ecosystem.',
        'status': Phase.Status.CURRENT,
        'order': 0,
        'features': {'one': 'community', 'two': 'referral program'},
    },
    {
        'slug': Phase.Slug.V1,
        'title': 'V1 - Emergence',
        'description': 'Token launch and the first utilities go live.',
        'status': Phase.Status.COMING_SOON,
        'order': 1,
        'features': {'one': 'token launch', 'two': 'first utilities'},
    },
    {
        'slug': Phase.Slug.V2,
        'title': 'V2 - Evolution',
        'description': 'Prediction markets open. The Observer begins watching.',
        'status': Phase.Status.COMING_SOON,
        'order': 2,
        'features': {'one': 'prediction markets', 'two': 'the observer begins watching'},
    },
    {
        'slug': Phase.Slug.V3,
        'title': 'V3 - Intelligence',
        'description': 'Insurance layer and ecosystem partners come online.',
        'status': Phase.Status.COMING_SOON,
        'order': 3,
        'features': {'one': 'insurance layer'},
    },
    {
        'slug': Phase.Slug.V4,
        'title': 'V4 - Governance',
        'description': 'The daily game show and full reward ecosystem.',
        'status': Phase.Status.COMING_SOON,
        'order': 4,
        'features': {'one': 'full reward ecosystem'},
    },
    {
        'slug': Phase.Slug.V5,
        'title': 'V5 - Nexus',
        'description': 'A fully integrated decentralized financial network.',
        'status': Phase.Status.COMING_SOON,
        'order': 5,
        'features': {'one': 'decentralized financial network'},
    },
]

FAQ_ITEMS = [
    {
        'category': 'FAQs',
        'question': 'When does presale start?',
        'answer': 'Soon',
        'order': 0,
    },
    {
        'category': 'FAQs',
        'question': 'When does v1 come?',
        'answer': 'Soon',
        'order': 1,
    },
]

POSTS = [
    {
        'slug': 'vaultor-v0-is-live',
        'title': 'Vaultor V0 is live',
        'body': 'V0 is finally live, lets get things started',
        'category': 'FAQs',
        'published': True,
        'cover_image': 'vaultor-v0-is-live.jpg',
    },
]


class Command(BaseCommand):
    help = "Seed SiteConfig, Phases, FAQ items, and Posts with Vaultor's finalized content."

    @transaction.atomic
    def handle(self, *args, **options):
        self._seed_site_config()
        self._seed_phases()
        self._seed_faq_items()
        self._seed_posts()
        self.stdout.write(self.style.SUCCESS('seed_content complete.'))

    def _seed_site_config(self):
        config = SiteConfig.load()
        for field, value in SITE_CONFIG.items():
            setattr(config, field, value)
        config.save()
        self.stdout.write('SiteConfig: updated')

    def _seed_phases(self):
        for data in PHASES:
            slug = data['slug']
            fields = {k: v for k, v in data.items() if k != 'slug'}
            _, created = Phase.objects.update_or_create(slug=slug, defaults=fields)
            self.stdout.write(f'Phase {slug}: {"created" if created else "updated"}')

    def _seed_faq_items(self):
        for data in FAQ_ITEMS:
            question = data['question']
            fields = {k: v for k, v in data.items() if k != 'question'}
            _, created = FAQItem.objects.update_or_create(question=question, defaults=fields)
            self.stdout.write(f'FAQItem "{question}": {"created" if created else "updated"}')

    def _seed_posts(self):
        for data in POSTS:
            slug = data['slug']
            cover_image_filename = data.get('cover_image')
            fields = {k: v for k, v in data.items() if k not in ('slug', 'cover_image')}

            if cover_image_filename:
                # Copy straight to a fixed relative path rather than going through
                # FieldFile.save(), which appends a random suffix whenever a file
                # already exists there - that would leave an orphaned copy behind
                # on every rerun instead of just overwriting it in place.
                relative_path = f'updates/covers/{cover_image_filename}'
                dest = Path(settings.MEDIA_ROOT) / relative_path
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(SEED_MEDIA_DIR / cover_image_filename, dest)
                fields['cover_image'] = relative_path

            _, created = Post.objects.update_or_create(slug=slug, defaults=fields)
            self.stdout.write(f'Post "{slug}": {"created" if created else "updated"}')
