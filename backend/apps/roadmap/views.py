from rest_framework import viewsets

from .models import Phase
from .serializers import PhaseSerializer


class PhaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Phase.objects.all()
    serializer_class = PhaseSerializer
