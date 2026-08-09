from django.urls import path

from .views import ChallengeView, LogoutView, MeView, VerifyView

urlpatterns = [
    path('challenge/', ChallengeView.as_view(), name='accounts-challenge'),
    path('verify/', VerifyView.as_view(), name='accounts-verify'),
    path('me/', MeView.as_view(), name='accounts-me'),
    path('logout/', LogoutView.as_view(), name='accounts-logout'),
]
