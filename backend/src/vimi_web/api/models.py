import uuid

from storages.backends.ftp import FTPStorage
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

# file_storage = FTPStorage()

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)


class Model(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    extension = models.CharField(max_length=16)
    # file = models.FileField(upload_to='srv/ftp/models/')

    # model = models.FileField(upload_to='models/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ModelInput(models.Model):
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    path = models.CharField(max_length=100)
    # input = models.FileField(upload_to='inputs/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

