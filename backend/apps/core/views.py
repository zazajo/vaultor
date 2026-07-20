from rest_framework.generics import RetrieveAPIView

from .models import SiteConfig
from .serializers import SiteConfigSerializer


class SiteConfigView(RetrieveAPIView):
    serializer_class = SiteConfigSerializer

    def get_object(self):
        return SiteConfig.load()
