import uuid
from importlib import import_module
from typing import List, Optional

import keras
from storages.backends.ftp import FTPStorage
from django.contrib.auth import get_user_model
from django.db import models
from django.contrib.postgres.fields import ArrayField

User = get_user_model()

# file_storage = FTPStorage()

class UserDetail(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)


class Architecture(models.Model):
    name = models.CharField(max_length=64, unique=True)
    module = models.CharField(max_length=256)
    layers = ArrayField(models.CharField(max_length=64))
    dimensions = ArrayField(ArrayField(models.PositiveIntegerField(default=1), size=3))

    def __str__(self) -> str:
        return self.name

    def get_model(self) -> keras.Model:
        module = import_module(self.module)
        model_caller = getattr(module, self.name)
        return model_caller()

    def get_computed_layers(self, model: Optional[keras.Model] = None) -> List[str]:
        # TODO: validate that the model is our model!
        if model is None:
            model = self.get_model()

        return [layer.name for layer in model.layers]

    def get_computed_dimensions(self, model: Optional[keras.Model]) -> List[List[int]]:
        # TODO: validate that the model is our model!
        # TODO: Set reasonable defaults for the dimensions. Aka defaults from dimensions model class field
        if model is None:
            model = self.get_model()

        dimensions = [list(model.input_shape[1:])] + [list(layer.output.shape[1:]) for layer in model.layers[1:]]
        return [dimension + [1] * (3 - len(dimension)) for dimension in dimensions]
