from django.urls import path, include

from vimi_web.api import views

urlpatterns = [
    path("authentication/", include("vimi_web.authentication.urls")),
    path("config/frontend/", views.ConfigFrontendView.as_view(), name="config_frontend"),
]
