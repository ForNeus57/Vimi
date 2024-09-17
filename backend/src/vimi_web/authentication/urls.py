from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView, TokenBlacklistView

from vimi_web.authentication.views import RegisterUser

urlpatterns = [
    path('user/register/', RegisterUser.as_view(), name='user-register'),

    path('token/jwt/', TokenObtainPairView.as_view(), name='token-jwt-obtain_pair'),
    path('token/jwt/refresh/', TokenRefreshView.as_view(), name='token-jwt-refresh'),
    path('token/jwt/verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('token/jwt/blacklist/', TokenBlacklistView.as_view(), name='token-jwt-blacklist'),
]