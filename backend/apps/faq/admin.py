from django.contrib import admin

from .models import FAQItem


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order')
    list_editable = ('order',)
    list_filter = ('category',)
    ordering = ('category', 'order')
