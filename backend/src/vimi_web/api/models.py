import uuid
from importlib import import_module
from typing import List, Optional

import cv2
import keras
import numpy as np
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db.models import (
    Model,
    OneToOneField,
    UUIDField,
    CharField,
    PositiveIntegerField,
    CASCADE,
    FileField,
)

User = get_user_model()

class UserDetail(Model):
    user = OneToOneField(User, on_delete=CASCADE)
    uuid = UUIDField(default=uuid.uuid4, editable=False, unique=True)


class Architecture(Model):
    # TODO: Join layers and dimensions into a single field and create a custom postgresql field for it!
    name = CharField(max_length=64, unique=True, editable=False)
    module = CharField(max_length=256, editable=False)
    layers = ArrayField(base_field=CharField(max_length=64))
    dimensions = ArrayField(base_field=ArrayField(base_field=PositiveIntegerField(default=1), size=3))

    def __str__(self) -> str:
        return self.name

    def clean(self) -> None:
        if len(self.layers) != len(self.dimensions):
            raise ValueError("The number of layers and dimensions should be equal!")

        model = self.get_model()
        computed_layers = self.get_computed_layers(model)
        computed_dimensions = self.get_computed_dimensions(model)

        if self.layers != computed_layers:
            raise ValueError("The layers are not the same as the computed layers!")

        if self.dimensions != computed_dimensions:
            raise ValueError("The dimensions are not the same as the computed dimensions!")

    def get_model(self) -> keras.Model:
        module = import_module(self.module)
        model_caller = getattr(module, self.name)
        return model_caller()

    @staticmethod
    def get_computed_layers(model: keras.Model) -> List[str]:
        return [f'{layer.name} ({layer.__class__.__name__})' for layer in model.layers]

    @staticmethod
    def get_computed_dimensions(model: keras.Model) -> List[List[int]]:
        # TODO: Set reasonable defaults for the dimensions. Aka defaults from dimensions model class field!

        dimensions = [list(model.input.shape[1:])] + [list(layer.output.shape[1:]) for layer in model.layers[1:]]
        return [dimension + [1] * (3 - len(dimension)) for dimension in dimensions]


class NetworkInput(Model):
    id = UUIDField(default=uuid.uuid4, primary_key=True)
    # TODO: Make use of MEDIA_ROOT and change this to ftp-server
    file = FileField(upload_to='fixtures/upload/', max_length=128, editable=False)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_network_input'


class ColorMap(Model):
    name = CharField(max_length=32, unique=True)
    attribute = CharField(max_length=32, unique=True, editable=False)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_color_map'

    def __str__(self) -> str:
        return self.name

    def get_color_map(self) -> int:
        import cv2
        return getattr(cv2, self.attribute)

    def apply_color_map(self, image: np.ndarray) -> np.ndarray:
        color_map = self.get_color_map()
        return cv2.applyColorMap(image, colormap=color_map)
