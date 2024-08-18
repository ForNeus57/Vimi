from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from vimi_web.api import views

urlpatterns = [
    path('api/authenticate/token/', TokenObtainPairView.as_view()),
    path('api/authenticate/token/refresh/', TokenRefreshView.as_view()),

    path("config/frontend/", views.config_frontend),
]
