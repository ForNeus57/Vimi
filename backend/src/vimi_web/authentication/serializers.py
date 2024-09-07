from typing import MutableMapping

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers

from vimi_web.api.models import UserDetail

User = get_user_model()

class RegisterUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True, min_length=8, max_length=32)
    first_name = serializers.CharField(required=True, min_length=2, max_length=32)
    last_name = serializers.CharField(required=True, min_length=2, max_length=32)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    password_confirm = serializers.CharField(required=True, min_length=8, write_only=True)

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

    def validate_username(self, value):
        if not value.isalnum():
            raise serializers.ValidationError("Username must contain alphanumeric.")

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already in use.")

        return value

    def validate_first_name(self, value):
        if not value.isalpha():
            raise serializers.ValidationError("First name must contain only letters.")

        return value.title()

    def validate_last_name(self, value):
        if not value.isalpha():
            raise serializers.ValidationError("Last name must contain only letters.")

        return value.title()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")

        return value

    def validate_password(self, value):
        # TODO: check if ValidationError is the same as serializers.ValidationError ?
        try:
            validate_password(value)
        except ValidationError as error:
            raise serializers.ValidationError(str(error))

        return value
