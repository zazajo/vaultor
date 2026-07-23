"""
URL configuration for vaultor_v0 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
import re
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/config/', include('apps.core.urls')),
    path('api/roadmap/', include('apps.roadmap.urls')),
    path('api/updates/', include('apps.updates.urls')),
    path('api/faq/', include('apps.faq.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# django.conf.urls.static.static() silently no-ops when DEBUG=False, but this
# project has no S3/cloud storage configured, so Django has to serve uploaded
# media itself in production too.
urlpatterns += [
    re_path(r'^%s(?P<path>.*)$' % re.escape(settings.MEDIA_URL.lstrip('/')), serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]
