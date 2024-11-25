from importlib import import_module
from tempfile import TemporaryFile
from typing import List, Optional, Tuple
from uuid import uuid4

import cv2
import numpy as np
import keras
from django.urls import reverse
from django.utils.http import urlencode
from keras.api import layers
from django.core.files.base import ContentFile
from django.db.models.functions import Lower
from django.db import models
from django.core.files import File
from django.contrib.postgres import fields as postgresql_fields
from django.utils.translation import gettext_lazy as _
from rest_framework.request import Request


class Architecture(models.Model):
    # TODO: consider changing name, module into enums to prevent remote code execution
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    name = models.CharField(max_length=64, unique=True, editable=False)
    module = models.CharField(max_length=64, editable=False)

    def __str__(self) -> str:
        return self.name

    def get_model(self, input_shape: Optional[Tuple[int | None, ...]] = None) -> keras.Model:
        module = import_module(self.module)
        model_caller = getattr(module, self.name)

        if input_shape is None:
            input_tensor = None
        else:
            input_tensor = layers.Input(shape=input_shape)

        # TODO: Find why tensorflow logs a user warning here?
        return model_caller(input_tensor=input_tensor)

    @staticmethod
    def get_computed_layers(model: keras.Model) -> List[str]:
        return [f'{layer.name} ({layer.__class__.__name__})' for layer in model.layers]

    @staticmethod
    def get_computed_dimensions(model: keras.Model) -> List[List[int]]:
        # TODO: Set reasonable defaults for the dimensions. Aka defaults from dimensions model class field!

        dimensions = [list(model.input.shape[1:])] + [list(layer.output.shape[1:]) for layer in model.layers[1:]]
        return [dimension + [1] * (3 - len(dimension)) for dimension in dimensions]


class Layer(models.Model):
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    architecture = models.ForeignKey(to=Architecture, related_name='layers', on_delete=models.CASCADE)
    # TODO: Validate this field
    layer_number = models.PositiveIntegerField()
    name = models.CharField(max_length=128)
    dimensions = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(default=1),
                                              size=3)


class NetworkInput(models.Model):
    class Transformation(models.TextChoices):
        RESCALE_NEAREST_NEIGHBOR = 'rescale_nearest_neighbor', _("Rescale Image - Nearest Neighbor")
        RESCALE_LINEAR = 'rescale_linear', _("Rescale Image - Linear")
        RESCALE_CUBIC = 'rescale_cubic', _("Rescale Image - Cubic")
        KEEP_ORIGINAL = 'keep_original', _("Keep Image Dimensions")

    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    # TODO: Consider changing it to image file
    file = models.FileField(upload_to='upload/', max_length=128, editable=False)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_network_input'

    def transform_input_adjust_model(self, architecture: Architecture, transformation: Transformation) -> Tuple[np.ndarray, keras.Model]:
        image = cv2.imread(self.file.path, cv2.IMREAD_COLOR) / 255
        assert image is not None, 'Image could not be loaded'
        assert len(image.shape) == 3, 'Image must have 3 channels'

        match transformation:
            case self.Transformation.KEEP_ORIGINAL:
                return np.expand_dims(image, axis=0), architecture.get_model(image.shape)

            case self.Transformation.RESCALE_NEAREST_NEIGHBOR:
                model = architecture.get_model()
                scaled_image =cv2.resize(image,
                                         dsize=model.input.shape[1:3],
                                         interpolation=cv2.INTER_NEAREST)
                return np.expand_dims(scaled_image, axis=0), model

            case self.Transformation.RESCALE_LINEAR:
                model = architecture.get_model()
                scaled_image =cv2.resize(image,
                                         dsize=model.input.shape[1:3],
                                         interpolation=cv2.INTER_LINEAR)
                return np.expand_dims(scaled_image, axis=0), model

            case self.Transformation.RESCALE_CUBIC:
                model = architecture.get_model()
                scaled_image =cv2.resize(image,
                                         dsize=model.input.shape[1:3],
                                         interpolation=cv2.INTER_CUBIC)
                return np.expand_dims(scaled_image, axis=0), model

            case _:
                assert False, 'Unknown transformation provided'


class Activation(models.Model):
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    architecture = models.ForeignKey(to=Architecture, related_name='activations', on_delete=models.PROTECT)
    network_input = models.ForeignKey(to=NetworkInput, related_name='activations', on_delete=models.PROTECT)
    layer = models.ForeignKey(to=Layer, related_name='activations', on_delete=models.PROTECT)
    transformation = models.CharField(choices=NetworkInput.Transformation)
    # TODO: Validate this size
    activation_binary = models.FileField(upload_to='activation/', max_length=64)

    # TODO: Do something with code duplication
    @staticmethod
    def to_file(array: np.ndarray) -> File:
        # TODO: Change this into custom create classmethod for this object
        temporary_file = TemporaryFile()
        np.save(temporary_file, array, allow_pickle=False)

        file = File(temporary_file)
        file.name = f'{uuid4()}.npy'

        return file

    def to_numpy(self) -> np.ndarray:
        return np.load(self.activation_binary, allow_pickle=False)


class ColorMap(models.Model):
    class Normalization(models.TextChoices):
        GLOBAL = 'global', _("Global")
        LOCAL = 'local', _("Local")

    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    name = models.CharField(max_length=32, unique=True)
    # TODO: Validate this field
    attribute = models.CharField(max_length=32, editable=False, null=True)
    # TODO: Validate this field
    user_map_binary = models.BinaryField(max_length=1024, unique=True)          # 1KiB; shape=(256, 3); dtype=np.uint8;

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_color_map'
        constraints = (
            models.UniqueConstraint(Lower('attribute').desc(),
                                    name='api_color_map_attribute_key',
                                    condition=models.Q(attribute__isnull=False)),
        )

    def __str__(self) -> str:
        return self.name

    def get_color_map(self) -> Optional[int]:
        if self.attribute is None:
            return None

        import cv2
        return getattr(cv2, self.attribute)

    def get_user_map(self) -> np.ndarray:
        return np.frombuffer(self.user_map_binary, dtype=np.uint8).reshape((256, 3))

    def normalize_activations(self, activation: np.ndarray, normalization: Normalization) -> np.ndarray:
        assert len(activation.shape) == 3, 'activations must be grayscale stream'

        match normalization:
            case self.Normalization.GLOBAL:
                activation_range = np.ptp(activation)
                return (((activation - np.min(activation)) / activation_range) * 255.).astype(np.uint8)

            case self.Normalization.LOCAL:
                activation_range = np.ptp(activation, axis=(0, 1))
                activation_range[activation_range == 0.] = 1.
                return (((activation - np.min(activation, axis=(0, 1))) / activation_range) * 255.).astype(np.uint8)

            case _:
                assert False, 'Unknown normalization method provided'

    def apply_color_map(self, activations: np.ndarray) -> np.ndarray:
        assert len(activations.shape) == 3, 'activations must be grayscale stream'
        assert activations.dtype == np.uint8, 'activations colors must be uint8'

        user_map = self.get_user_map()
        # TODO: Remove this assert if validation is implemented
        assert len(user_map.shape) == 2, 'user_map has too many or not enough dimensions'

        x_size, y_size, z_size = activations.shape
        _, channels = user_map.shape
        image_mapped = np.zeros((x_size, y_size, channels, z_size), dtype=np.uint8)
        for z_index in range(z_size):
            for channel_index in range(channels):
                image_mapped[:, :, channel_index, z_index] = cv2.applyColorMap(activations[:, :, z_index],
                                                                               userColor=user_map[:, channel_index])

        return image_mapped


class Texture(models.Model):
    class CubeSide(models.IntegerChoices):
        POS_X = 0, _("Positive X")
        NEG_X = 1, _("Negative X")
        POS_Y = 2, _("Positive Y")
        NEG_Y = 3, _("Negative Y")
        POS_Z = 4, _("Positive Z")
        NEG_Z = 5, _("Negative Z")

    class Extension(models.TextChoices):
        PNG = ".png", _("PNG")

    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    activation = models.ForeignKey(to=Activation, related_name='textures', on_delete=models.PROTECT)
    color_map = models.ForeignKey(to=ColorMap, related_name='color_maps', on_delete=models.PROTECT)
    normalization = models.CharField(choices=ColorMap.Normalization)
    # TODO: Validate this size
    binary_data_file = models.FileField(upload_to='texture/', max_length=64)
    shape = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(), size=4)

    # TODO: Do something with code duplication
    @staticmethod
    def to_file(array: np.ndarray) -> File:
        # TODO: Change this into custom create classmethod for this object
        temporary_file = TemporaryFile(mode='w+b')
        np.save(temporary_file, array, allow_pickle=False)

        file = File(temporary_file)
        file.name = f'{uuid4()}.npy'

        return file

    def to_numpy(self) -> np.ndarray:
        return np.load(self.binary_data_file, allow_pickle=False)

    def get_available_urls(self, request: Request) -> List[List[str]]:
        colored_activations = self.to_numpy()
        _, _, _, filters = colored_activations.shape

        return [[request.build_absolute_uri(f'{reverse('api-texture')}?{urlencode({
                     'texture': self.uuid,
                     'filter_index': filter_index,
                     'cube_side': cube_side_index,
                     'compression_level': 9,
                 })}')
                 for cube_side_index, _ in self.CubeSide.choices]
                 for filter_index in range(filters)]

    def positive_x(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return np.expand_dims(selected_filter[:, -1, :], axis=1)

    def negative_x(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return np.expand_dims(selected_filter[:, 0, :], axis=1)

    def positive_y(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return np.expand_dims(selected_filter[0, :, :], axis=0)

    def negative_y(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return np.expand_dims(selected_filter[-1, :, :], axis=0)

    def positive_z(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return selected_filter

    def negative_z(self, index: int) -> np.ndarray:
        selected_filter = self.to_numpy()[:, :, :, index]
        return np.flip(selected_filter, axis=1)

    def get_slice(self, filter_index: int, cube_side: CubeSide) -> np.ndarray:
        match cube_side:
            case self.CubeSide.POS_X:
                selected_side = self.positive_x(filter_index)

            case self.CubeSide.NEG_X:
                selected_side = self.negative_x(filter_index)

            case self.CubeSide.POS_Y:
                selected_side = self.positive_y(filter_index)

            case self.CubeSide.NEG_Y:
                selected_side = self.negative_y(filter_index)

            case self.CubeSide.POS_Z:
                selected_side = self.positive_z(filter_index)

            case self.CubeSide.NEG_Z:
                selected_side = self.negative_z(filter_index)

            case _:
                assert False, 'Unknown mode provided'

        return selected_side

    def get_file(self, filter_slice: np.ndarray, compression_level: int) -> ContentFile:
        extension_key = self.Extension.PNG
        success, frame = cv2.imencode(ext=extension_key,
                                      img=filter_slice,
                                      params=(cv2.IMWRITE_PNG_COMPRESSION, compression_level))
        assert success, 'Image was not encoded properly'

        file = ContentFile(frame)
        file.name = f'{uuid4()}{extension_key}'
        return file
