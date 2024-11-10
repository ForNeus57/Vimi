from typing import MutableMapping

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password, get_password_validators
from rest_framework import serializers

from vimi_web.authentication.models import UserDetail

User = get_user_model()


class RegisterUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        **settings.USERNAME_VALIDATORS['general'],
        validators=get_password_validators(settings.USERNAME_VALIDATORS['validators']))

    first_name = serializers.CharField(
        **settings.FIRST_NAME_VALIDATORS['general'],
        validators=get_password_validators(settings.FIRST_NAME_VALIDATORS['validators']))

    last_name = serializers.CharField(
        **settings.LAST_NAME_VALIDATORS['general'],
        validators=get_password_validators(settings.LAST_NAME_VALIDATORS['validators']))

    email = serializers.EmailField(
        **settings.EMAIL_VALIDATORS['general'],
        validators=get_password_validators(settings.EMAIL_VALIDATORS['validators']))

    password = serializers.CharField(
        **settings.PASSWORD_VALIDATORS['general'],
        **settings.PASSWORD_VALIDATORS['specific'],
        validators=[validate_password,])

    password_confirm = serializers.CharField(
        **settings.PASSWORD_VALIDATORS['general'],
        **settings.PASSWORD_VALIDATORS['specific'],
    )

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password', 'password_confirm')

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
            raise serializers.ValidationError("Passwords do not match")

        return data
