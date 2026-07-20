from django.db import models

from apps.roadmap.models import Phase


class SiteConfig(models.Model):
    presale_start = models.DateTimeField(null=True, blank=True)
    current_phase = models.CharField(max_length=10, choices=Phase.Slug.choices, default=Phase.Slug.V0)
    presale_open = models.BooleanField(default=False)
    social_links = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = 'Site configuration'
        verbose_name_plural = 'Site configuration'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Site Configuration'
