from collections import ChainMap

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.authentication.settings import (
    USERNAME_VALIDATORS,
    FIRST_NAME_VALIDATORS,
    LAST_NAME_VALIDATORS,
    EMAIL_VALIDATORS,
    PASSWORD_VALIDATORS,
)


class RegistrationConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            'username': {
                **USERNAME_VALIDATORS['general'],
                **USERNAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in USERNAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'firstName': {
                **FIRST_NAME_VALIDATORS['general'],
                **FIRST_NAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in FIRST_NAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'lastName': {
                **LAST_NAME_VALIDATORS['general'],
                **LAST_NAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in LAST_NAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'email': {
                **EMAIL_VALIDATORS['general'],
                **EMAIL_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in EMAIL_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'password': {
                **PASSWORD_VALIDATORS['general'],
                **PASSWORD_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in PASSWORD_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'confirmPassword': {
                **PASSWORD_VALIDATORS['general'],
                **PASSWORD_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in PASSWORD_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
        }, status=200)