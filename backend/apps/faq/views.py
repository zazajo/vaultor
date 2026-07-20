from rest_framework import viewsets

from .models import FAQItem
from .serializers import FAQItemSerializer


class FAQItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQItem.objects.all()
    serializer_class = FAQItemSerializer
