from os import environ

import redis
from rest_framework_simplejwt.tokens import AccessToken, AuthUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

redis_instance = redis.StrictRedis(
    username=environ['REDIS_USERNAME'],
    password=environ['REDIS_USER_PASSWORD'],
    host=environ['REDIS_HOST'],
    port=int(environ['REDIS_PORT']),
    db=2,
    decode_responses=True,
)

class RedisTokenBlacklist:
    @staticmethod
    def add(token: AccessToken) -> None:
        redis_instance.set(str(token), "blacklisted", ex=token.lifetime)

    @staticmethod
    def is_blacklisted(token: AccessToken) -> bool:
        return redis_instance.get(str(token)) is not None


class RedisJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token: AccessToken) -> AuthUser:
        if RedisTokenBlacklist.is_blacklisted(validated_token):
            raise AuthenticationFailed('Token is blacklisted')

        return super().get_user(validated_token)
