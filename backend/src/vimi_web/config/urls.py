from django.urls import path

from vimi_web.config.views import RegistrationConfigView

urlpatterns = [
    path('frontend/registration/', RegistrationConfigView.as_view(), name='frontend-registration'),
]