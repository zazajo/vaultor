from rest_framework.routers import DefaultRouter

from .views import FAQItemViewSet

router = DefaultRouter()
router.register('', FAQItemViewSet, basename='faqitem')

urlpatterns = router.urls
