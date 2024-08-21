from datetime import timedelta
from os import environ
from pathlib import Path

from vimi_lib.crypto.rsa_key_reader import get_rsa_private_key_from_file, get_rsa_public_key_from_private_key_file

ACCESS_TOKEN_LIFETIME = timedelta(minutes=10)
REFRESH_TOKEN_LIFETIME: timedelta(hours=12)
TOKEN_NOT_BEFORE = timedelta(seconds=0)

#     'UPDATE_LAST_LOGIN': True,

SIGNING_KEY = get_rsa_private_key_from_file(
    Path(environ['DJANGO_JWT_SIGNING_KEY_FILE_PATH']),
    environ['DJANGO_JWT_SIGNING_KEY_PASSWORD']
)
VERIFYING_KEY = get_rsa_public_key_from_private_key_file(
    Path(environ['DJANGO_JWT_VERIFYING_KEY_FILE_PATH']),
    environ['DJANGO_JWT_VERIFYING_KEY_PASSWORD']
)
ISSUER = environ['DJANGO_JWT_ISSUER']
AUDIENCE = environ['DJANGO_JWT_AUDIENCE']


#     'AUTH_HEADER_TYPES': ('Bearer',)