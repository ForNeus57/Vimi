from importlib import import_module
from typing import List, Optional, Tuple
from uuid import uuid4

import cv2
import numpy as np
import keras
from keras.api.layers import Input
from django.db import models
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.contrib.postgres import fields as postgresql_fields

User = get_user_model()

class UserDetail(models.Model):
    id = models.UUIDField(default=uuid4, editable=False, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Architecture(models.Model):
    # TODO: Join layers and dimensions into a single field and create a custom postgresql field for it!
    name = models.CharField(max_length=64, unique=True, editable=False)
    module = models.CharField(max_length=64, editable=False)
    layers = postgresql_fields.ArrayField(base_field=models.CharField(max_length=64))
    dimensions = postgresql_fields.ArrayField(
        base_field=postgresql_fields.ArrayField(
            base_field=models.PositiveIntegerField(default=1),
            size=3,
        ),
    )

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

    def get_model(self, input_shape: Optional[Tuple[int | None, ...]] = None) -> keras.Model:
        module = import_module(self.module)
        model_caller = getattr(module, self.name)

        if input_shape is None:
            return model_caller()
        else:
            input_tensor = Input(shape=input_shape)
            return model_caller(input_tensor=input_tensor)

    @staticmethod
    def get_computed_layers(model: keras.Model) -> List[str]:
        return [f'{layer.name} ({layer.__class__.__name__})' for layer in model.layers]

    @staticmethod
    def get_computed_dimensions(model: keras.Model) -> List[List[int]]:
        # TODO: Set reasonable defaults for the dimensions. Aka defaults from dimensions model class field!

        dimensions = [list(model.input.shape[1:])] + [list(layer.output.shape[1:]) for layer in model.layers[1:]]
        return [dimension + [1] * (3 - len(dimension)) for dimension in dimensions]


class NetworkInput(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True)
    file = models.FileField(upload_to='upload/', max_length=128, editable=False)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_network_input'


class ColorMap(models.Model):
    name = models.CharField(max_length=32, unique=True)
    # TODO: Consider removing this in favour of user_map_binary and generate it dynamically
    # TODO: Validate this field
    attribute = models.CharField(max_length=32, editable=False, null=True)
    # TODO: Validate this field
    user_map_binary = models.BinaryField(max_length=1024, null=True)                  # 1KiB; shape=(256, 3); dtype=np.uint8
    # TODO: Consider storing shape if necessary
    # user_map_shape = ArrayField(base_field=PositiveIntegerField(), size=3)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_color_map'
        ordering = ('id',)
        # TODO: Consider adding unique together to a attribute and user_map_binary

    def clean(self) -> None:
        if not ((self.attribute is None) ^ (self.user_map_binary is None)):
            raise ValueError("must provide either attribute or user_map_binary")

        # TODO: Finish validation

    def __str__(self) -> str:
        return self.name

    def get_color_map(self) -> Optional[int]:
        if self.attribute is None:
            return None

        import cv2
        return getattr(cv2, self.attribute)

    def get_user_map(self) -> Optional[np.ndarray]:
        if self.user_map_binary is None:
            return None

        return np.frombuffer(self.user_map_binary, dtype=np.uint8).reshape((256, 3))

    def apply_color_map(self, image: np.ndarray) -> np.ndarray:
        assert len(image.shape) == 2, 'image must be grayscale'
        assert image.dtype == np.uint8, 'image colors must be uint8'

        color_map = self.get_color_map()
        user_map = self.get_user_map()

        if color_map is not None:
            image_mapped = cv2.applyColorMap(image, colormap=color_map)
            return image_mapped
        else:
            assert len(user_map.shape) == 2, 'user_map has too many dimensions'

            _, channels = user_map.shape
            image_mapped = np.zeros(shape=image.shape + (channels,), dtype=image.dtype)
            for index in range(channels):
                image_mapped[:, :, index] = cv2.applyColorMap(image, userColor=user_map[:, index])

            return image_mapped

class Activation(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True)
    activation_binary = models.BinaryField(max_length=1024 * 512)             # 512KiB
    shape = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(), size=3)

    def to_numpy(self) -> np.ndarray:
        return np.frombuffer(self.activation_binary, dtype=np.uint8).reshape(self.shape)


class Texture(models.Model):
    texture_image = models.ImageField(upload_to='output/')
    # TODO: Validate the sape is adequate
    shape = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(), size=3)

    @staticmethod
    def to_image(array: np.ndarray) -> ContentFile:
        array = np.repeat(np.repeat(array, 8, axis=0), 8, axis=1)
        # filler = np.zeros_like(array, dtype=np.uint8)
        # array = np.block([[filler, array, filler, filler],
        #                   [array, array, array, array],
        #                   [filler, array, filler, filler]])
        _, frame_png = cv2.imencode('.png', array)

        file = ContentFile(frame_png)
        file.name = f'{uuid4()}.png'

        return file
