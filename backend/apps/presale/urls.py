from django.urls import path

from .views import AllocationView, PresaleStatusView

urlpatterns = [
    path('', PresaleStatusView.as_view(), name='presale-status'),
    path('allocation/', AllocationView.as_view(), name='presale-allocation'),
]
