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
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserDetail(models.Model):
    id = models.UUIDField(default=uuid4, editable=False, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Architecture(models.Model):
    # TODO: Join layers and dimensions into a single field and create a custom postgresql field for it!
    name = models.CharField(max_length=64, unique=True, editable=False)
    module = models.CharField(max_length=64, editable=False)
    layers = postgresql_fields.ArrayField(base_field=models.CharField(max_length=64))
    # TODO: Consider removing this model parameter
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
    user_map_binary = models.BinaryField(max_length=1024)                  # 1KiB; shape=(256, 3); dtype=np.uint8

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_color_map'
        # TODO: Consider adding unique together to a attribute and user_map_binary

    def clean(self) -> None:
        if not (self.attribute is None) ^ (self.user_map_binary is None):
            raise ValueError("must provide either attribute or user_map_binary")

        # TODO: Finish validation

    def __str__(self) -> str:
        return self.name

    def get_color_map(self) -> Optional[int]:
        if self.attribute is None:
            return None

        import cv2
        return getattr(cv2, self.attribute)

    def get_user_map(self) -> np.ndarray:
        return np.frombuffer(self.user_map_binary, dtype=np.uint8).reshape((256, 3))

    def apply_color_map(self, image: np.ndarray) -> np.ndarray:
        assert len(image.shape) == 2, 'image must be grayscale'
        assert image.dtype == np.uint8, 'image colors must be uint8'

        user_map = self.get_user_map()
        assert len(user_map.shape) == 2, 'user_map has too many or not enough dimensions'

        _, channels = user_map.shape
        image_mapped = np.zeros(shape=image.shape + (channels,), dtype=image.dtype)
        for index in range(channels):
            image_mapped[:, :, index] = cv2.applyColorMap(image, userColor=user_map[:, index])

        return image_mapped

    @staticmethod
    def get_generated_user_map_binary(cv2_color_map_attribute: int) -> bytes:
        # TODO: Check if an attribute is in cv2 library
        continues_gray_values = np.arange(256, dtype=np.uint8)
        color_function_values = cv2.applyColorMap(continues_gray_values, colormap=cv2_color_map_attribute)
        return color_function_values.tobytes()

    @staticmethod
    def get_generated_texture(array: np.ndarray, extension: Optional[str] = None, quality: Optional[int] = None) -> ContentFile:
        extension = extension or '.png'
        quality = quality or 4
        assert quality > 1, 'quality level must be above 1'

        array = np.repeat(np.repeat(array, quality, axis=0), quality, axis=1)
        # filler = np.zeros_like(array, dtype=np.uint8)
        # array = np.block([[filler, array, filler, filler],
        #                   [array, array, array, array],
        #                   [filler, array, filler, filler]])

        success, frame = cv2.imencode(extension, array)
        assert success, 'Image was not encoded properly'

        file = ContentFile(frame)
        file.name = f'{uuid4()}{extension}'

        return file


class Activation(models.Model):
    class Normalization(models.IntegerChoices):
        GLOBAL = 0, _("Global")
        LOCAL = 1, _("Local")

    id = models.UUIDField(default=uuid4, primary_key=True)
    # TODO: Change this to a file pointer to a static file
    # TODO: See why this field is not validated by django?
    activation_binary = models.BinaryField(max_length=1024 * 512)                               # 512KiB
    shape = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(), size=3)
    normalization = models.IntegerField(choices=Normalization)

    def to_numpy(self) -> np.ndarray:
        return np.frombuffer(self.activation_binary, dtype=np.uint8).reshape(self.shape)
