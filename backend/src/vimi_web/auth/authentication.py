from typing import Optional

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.http import HttpRequest

from vimi_web.auth.tokens import Token

User = get_user_model()


class JWTAuthentication(ModelBackend):
    def authenticate(self, request: Optional[HttpRequest], **kwargs) -> Optional[User]:
        if request is None:
            return None

        if len(kwargs) != 0:
            return None

        # No authorisation header
        if 'HTTP_AUTHORIZATION' not in request.META:
            return None

        auth_header = request.META['HTTP_AUTHORIZATION']
        if not auth_header.startswith('Bearer '):
            return None

        header_split = auth_header.split(' ')
        if len(header_split) != 2:
            return None

        token_raw = header_split[1]
        token = Token(token_raw)

        return self.get_user(token)

    def get_user(self, token: Token) -> Optional[User]:
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

