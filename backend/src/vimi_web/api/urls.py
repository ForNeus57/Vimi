from django.urls import path, include

from vimi_web.api import views

urlpatterns = [
    path("auth/", include("vimi_web.auth.urls")),
    path("config/frontend/", views.ConfigFrontendView.as_view(), name="config_frontend"),
]
