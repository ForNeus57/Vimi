"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""
from datetime import timedelta
from pathlib import Path
from os import environ

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key

from vimi_lib.crypto.rsa_key_reader import generate_rsa_private_key
from vimi_web.authentication.settings import PASSWORD_VALIDATORS

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = environ['DJANGO_SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = environ['DJANGO_DEBUG'] == 'True'

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',

    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',

    'vimi_web.api',
    'vimi_web.authentication',
    'vimi_web.worker',
    'vimi_web.config',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'vimi_web.core.middleware.MaxUploadSizeMiddleware',
]

ROOT_URLCONF = 'vimi_web.core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vimi_web.core.wsgi.application'

# FTP_USER = environ['DJANGO_FTP_USER']
# FTP_PASSWORD = environ['DJANGO_FTP_PASSWORD']
# FTP_HOST = environ['DJANGO_FTP_HOST']
# FTP_PORT = environ['DJANGO_FTP_PORT']
#
# FTP_STORAGE_LOCATION = f'ftp://{FTP_USER}:{FTP_PASSWORD}@{FTP_HOST}:{FTP_PORT}/'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',

        'USER': environ['POSTGRES_USERNAME'],
        'PASSWORD': environ['POSTGRES_PASSWORD'],
        'NAME': environ['POSTGRES_DATABASE_NAME'],
        'HOST': environ['POSTGRES_HOST'],
        'PORT': environ['POSTGRES_PORT'],
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{environ['REDIS_USERNAME']}:{environ['REDIS_USER_PASSWORD']}@{environ['REDIS_HOST']}:{environ['REDIS_PORT']}/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            },
        }
    },
    'authentication': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{environ['REDIS_USERNAME']}:{environ['REDIS_USER_PASSWORD']}@{environ['REDIS_HOST']}:{environ['REDIS_PORT']}/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            },
        }
    },
    'data': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'redis://{environ['REDIS_USERNAME']}:{environ['REDIS_USER_PASSWORD']}@{environ['REDIS_HOST']}:{environ['REDIS_PORT']}/2',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            },
        },
    },
}

# STORAGES = {
#     "default": {
#         "BACKEND": "vimi_web.api.storages.FTPStorage",
#         "OPTIONS": {
#             "host": environ['FTP_HOST'],
#             "port": environ['FTP_PORT'],
#             "login": environ['FTP_USERNAME'],
#             "password": environ['FTP_PASSWORD'],
#             "path": environ['FTP_PATH'],
#         },
#     }
# }

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
    ),
}

SIGNING_KEY = generate_rsa_private_key(1024).private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
)
VERIFIER_KEY = load_pem_private_key(
    SIGNING_KEY,
    password=None,
    backend=default_backend(),
).public_key().public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=12),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": "RS512",
    "SIGNING_KEY": SIGNING_KEY,
    "VERIFYING_KEY": VERIFIER_KEY,
    "ISSUER": environ['DJANGO_JWT_ISSUER'],
    "AUDIENCE": environ['DJANGO_JWT_AUDIENCE'],
}

AUTHENTICATION_BACKENDS = [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    'django.contrib.auth.backends.ModelBackend',
]

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

AUTH_PASSWORD_VALIDATORS = PASSWORD_VALIDATORS['validators']

# SECURE_SSL_REDIRECT = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
