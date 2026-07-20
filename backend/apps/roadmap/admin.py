from django.contrib import admin

from .models import Phase


@admin.register(Phase)
class PhaseAdmin(admin.ModelAdmin):
    list_display = ('slug', 'title', 'status', 'order')
    list_editable = ('status', 'order')
    ordering = ('order',)
