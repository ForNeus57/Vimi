from django.contrib.auth.models import User
from django.db.models.base import ModelBase
from django.db import models

from .apps import ApiConfig

class ModelMetaClass(ModelBase):
    def __new__(cls, name, bases, attrs):
        new_class = super().__new__(cls, name, bases, attrs)

        # new_class._meta.db_table = f"{ApiConfig.name.split('.')[-1]}_"
        # new_class._meta.verbose_name_plural = "News"
        return new_class


class UserDetail(models.Model):
    user_id = models.OneToOneField(User, on_delete=models.CASCADE)


class Model(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    # model = models.FileField(upload_to='models/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ModelInput(models.Model):
    model_id = models.ForeignKey(Model, on_delete=models.CASCADE)
    # input = models.FileField(upload_to='inputs/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Worker(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

