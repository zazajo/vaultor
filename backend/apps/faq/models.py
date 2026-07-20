from django.db import models


class FAQItem(models.Model):
    category = models.CharField(max_length=100, blank=True)
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return self.question
