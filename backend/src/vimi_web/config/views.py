from collections import ChainMap

from django.conf import settings

from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class RegistrationConfigView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request: Request) -> Response:
        return Response({
            'username': {
                **settings.USERNAME_VALIDATORS['general'],
                **settings.USERNAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.USERNAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'firstName': {
                **settings.FIRST_NAME_VALIDATORS['general'],
                **settings.FIRST_NAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.FIRST_NAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'lastName': {
                **settings.LAST_NAME_VALIDATORS['general'],
                **settings.LAST_NAME_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.LAST_NAME_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'email': {
                **settings.EMAIL_VALIDATORS['general'],
                **settings.EMAIL_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.EMAIL_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'password': {
                **settings.PASSWORD_VALIDATORS['general'],
                **settings.PASSWORD_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.PASSWORD_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
            'confirmPassword': {
                **settings.PASSWORD_VALIDATORS['general'],
                **settings.PASSWORD_VALIDATORS['html'],
                **dict(ChainMap(*[validator['OPTIONS'] for validator in settings.PASSWORD_VALIDATORS['validators'] if 'OPTIONS' in validator])),
            },
        }, status=200)