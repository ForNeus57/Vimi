from django.urls import path

from vimi_web.api import views

urlpatterns = [
    path("config/frontend/", views.frontend_config, name="api-overview"),
]
