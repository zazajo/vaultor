from django.apps import AppConfig


# Named PresaleAppConfig rather than the conventional PresaleConfig to avoid
# reading as a clash with the PresaleConfig *model* in models.py.
class PresaleAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.presale'
    label = 'presale'
