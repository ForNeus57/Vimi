from typing import MutableMapping

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password, get_password_validators
from rest_framework import serializers

from vimi_web.api.models import UserDetail
from vimi_web.authentication.settings import (
    USERNAME_VALIDATORS,
    FIRST_NAME_VALIDATORS,
    LAST_NAME_VALIDATORS,
    EMAIL_VALIDATORS,
    PASSWORD_VALIDATORS,
)

User = get_user_model()

class RegisterUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        **USERNAME_VALIDATORS['general'],
        validators=get_password_validators(USERNAME_VALIDATORS['validators']))

    first_name = serializers.CharField(
        **FIRST_NAME_VALIDATORS['general'],
        validators=get_password_validators(FIRST_NAME_VALIDATORS['validators']))

    last_name = serializers.CharField(
        **LAST_NAME_VALIDATORS['general'],
        validators=get_password_validators(LAST_NAME_VALIDATORS['validators']))

    email = serializers.EmailField(
        **EMAIL_VALIDATORS['general'],
        validators=get_password_validators(EMAIL_VALIDATORS['validators']))

    password = serializers.CharField(
        **PASSWORD_VALIDATORS['general'],
        **PASSWORD_VALIDATORS['specific'],
        validators=[validate_password])

    password_confirm = serializers.CharField(
        **PASSWORD_VALIDATORS['general'],
        **PASSWORD_VALIDATORS['specific'],
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'password_confirm']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])

        detail = UserDetail.objects.create(user=user)

        user.save()
        detail.save()

        return user

    def validate(self, data: MutableMapping):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")

        return data
