from django.urls import path
from rest_framework_simplejwt import views as views_simplejwt

from vimi_web.authentication import views

urlpatterns = [
    path('user/register/', views.RegisterUser.as_view(), name='user-register'),

    path('token/jwt/', views_simplejwt.TokenObtainPairView.as_view(), name='token-jwt-obtain_pair'),
    path('token/jwt/refresh/', views_simplejwt.TokenRefreshView.as_view(), name='token-jwt-refresh'),
    path('token/jwt/verify/', views_simplejwt.TokenVerifyView.as_view(), name='token-verify'),
    path('token/jwt/blacklist/', views_simplejwt.TokenBlacklistView.as_view(), name='token-jwt-blacklist'),
]