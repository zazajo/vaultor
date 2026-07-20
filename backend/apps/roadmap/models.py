from django.db import models


class Phase(models.Model):
    class Slug(models.TextChoices):
        V0 = 'v0', 'V0'
        V1 = 'v1', 'V1'
        V2 = 'v2', 'V2'
        V3 = 'v3', 'V3'
        V4 = 'v4', 'V4'
        V5 = 'v5', 'V5'

    class Status(models.TextChoices):
        CURRENT = 'current', 'Current'
        COMING_SOON = 'coming_soon', 'Coming Soon'
        COMPLETE = 'complete', 'Complete'

    slug = models.CharField(max_length=10, choices=Slug.choices, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMING_SOON)
    order = models.PositiveIntegerField(default=0)
    features = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.slug} — {self.title}'
