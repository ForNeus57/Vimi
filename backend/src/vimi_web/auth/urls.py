from django.urls import path

from vimi_web.auth.views import GetJWTView, RefreshJWTView, VerifyJWTView, BlacklistJWTView

urlpatterns = [
    path('token/jwt/', GetJWTView.as_view(), name='token_obtain_pair'),
    path('token/jwt/refresh/', RefreshJWTView.as_view(), name='token_refresh'),
    path('token/jwt/verify/', VerifyJWTView.as_view(), name='token_verify'),
    path('token/jwt/blacklist/', BlacklistJWTView.as_view(), name='token_blacklist'),
]