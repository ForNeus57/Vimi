import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    image_path = models.CharField(max_length=100)


class Model(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    path = models.CharField(max_length=100)
    # model = models.FileField(upload_to='models/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ModelInput(models.Model):
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    path = models.CharField(max_length=100)
    # input = models.FileField(upload_to='inputs/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Worker(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
