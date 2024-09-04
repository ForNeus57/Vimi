from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView, TokenBlacklistView

urlpatterns = [
    path('token/jwt/', TokenObtainPairView.as_view(), name='token_jwt_obtain_pair'),
    path('token/jwt/refresh/', TokenRefreshView.as_view(), name='token_jwt_refresh'),
    path('token/jwt/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/jwt/blacklist/', TokenBlacklistView.as_view(), name='token_jwt_blacklist'),
]