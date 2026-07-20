from rest_framework.routers import DefaultRouter

from .views import PhaseViewSet

router = DefaultRouter()
router.register('', PhaseViewSet, basename='phase')

urlpatterns = router.urls
