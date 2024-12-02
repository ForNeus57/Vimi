from importlib import import_module
from tempfile import TemporaryFile
from typing import List, Optional, Tuple, Callable
from uuid import uuid4

import cv2
import numpy as np
import tensorflow as tf
import keras
from keras import backend as k
from django.urls import reverse
from django.core.cache import caches
from django.utils.http import urlencode
from django.core.files.base import ContentFile
from django.db.models.functions import Lower
from django.db import models
from django.core.files import File
from django.contrib.postgres import fields as postgresql_fields
from django.utils.translation import gettext_lazy as _
from rest_framework.request import Request

in_memory_cache = caches['in_memory']


class Architecture(models.Model):
    # TODO: consider changing name, module into enums to prevent remote code execution
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    name = models.CharField(max_length=64, unique=True, editable=False)
    module = models.CharField(max_length=64, editable=False)

    def __str__(self) -> str:
        return self.name

    def get_model(self) -> keras.Model:
        k.clear_session()
        module = import_module(self.module)
        return getattr(module, self.name)()

    def get_preprocess_input_function(self) -> Callable[[np.ndarray, Optional[str]], np.ndarray]:
        module = import_module(self.module)
        return getattr(module, 'preprocess_input')

    def get_decode_predictions_function(self) -> Callable[[np.ndarray, int], np.ndarray]:
        module = import_module(self.module)
        return getattr(module, 'decode_predictions')

    def get_layers(self) -> List:
        # TODO: Fix this typing
        dimension_field = Layer._meta.get_field('dimensions')
        dimensions_default = dimension_field.base_field.default
        dimensions_size = dimension_field.size
        model = self.get_model()

        return [Layer(architecture=self,
                      layer_number=index,
                      name=layer.name,
                      type=layer.__class__.__name__,
                      dimensions=list(layer.output.shape[1:]) + [dimensions_default] * (dimensions_size - len(layer.output.shape[1:])))
                for index, layer in enumerate(model.layers)]

    def get_layer_count(self) -> int:
        return self.layers.count()


class Layer(models.Model):
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    architecture = models.ForeignKey(to=Architecture, related_name='layers', on_delete=models.CASCADE)
    # TODO: Validate this field
    layer_number = models.PositiveIntegerField(editable=False)
    name = models.CharField(max_length=128)
    type = models.CharField(max_length=64)
    dimensions = postgresql_fields.ArrayField(base_field=models.PositiveIntegerField(default=1),
                                              size=3)

    def __str__(self) -> str:
        return f'{self.name} ({self.type})'

    def get_presentation_name(self) -> str:
        return str(self)

    def get_presentation_dimensions(self) -> str:
        return str(tuple(self.dimensions))


class NetworkInput(models.Model):
    class Transformation(models.TextChoices):
        RESCALE_BILINEAR = 'rescale_bilinear', _("Bilinear interpolation")
        RESCALE_LANCZOS3 = 'rescale_lanczos3', _("Lanczos kernel with radius 3")
        RESCALE_LANCZOS5 = 'rescale_lanczos5', _("Lanczos kernel with radius 5")
        RESCALE_BICUBIC = 'rescale_bicubic', _("Bicubic interpolation")
        RESCALE_GAUSSIAN = 'rescale_gaussian', _("Gaussian kernel with radius 3")
        RESCALE_NEAREST = 'rescale_nearest', _("Nearest neighbor interpolation")
        RESCALE_AREA = 'rescale_area', _("Anti-aliased resampling")
        RESCALE_MITCHELLCUBIC = 'rescale_mitchellcubic', _("Mitchell-Netravali Cubic")

    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    # TODO: Consider changing it to image file
    file = models.FileField(upload_to='upload/', max_length=128, editable=False)
    sha256_hash = models.BinaryField(max_length=32, unique=True, editable=False)    # 256 / 8 = 32

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_network_input'

    def get_base_filename(self) -> str | None:
        return self.file.name

    def transform_input_adjust_model(self,
                                     architecture: Architecture,
                                     transformation: Transformation) -> Tuple[np.ndarray, keras.Model]:
        image = cv2.imread(self.file.path, cv2.IMREAD_COLOR)
        # TODO: Make this a part of NetworkInput Validation
        assert image is not None, 'Image could not be loaded'
        assert len(image.shape) == 3, 'Image must be a tensor, as in color'
        assert image.dtype == np.uint8, 'Image must be uint8 dtype'
        assert image.shape[2] == 3, 'Image channels must be last and image must be in color'

        model = architecture.get_model()
        preprocess_input = architecture.get_preprocess_input_function()

        processed_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        processed_image = np.expand_dims(processed_image, axis=0)
        processed_image = preprocess_input(processed_image, 'channels_last')

        match transformation:
            case self.Transformation.RESCALE_BILINEAR:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.BILINEAR)

            case self.Transformation.RESCALE_LANCZOS3:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.LANCZOS3)

            case self.Transformation.RESCALE_LANCZOS5:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.LANCZOS5)

            case self.Transformation.RESCALE_BICUBIC:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.BICUBIC)

            case self.Transformation.RESCALE_GAUSSIAN:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.GAUSSIAN)

            case self.Transformation.RESCALE_NEAREST:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.NEAREST_NEIGHBOR)
                processed_image = tf.cast(processed_image, dtype=np.float32)

            case self.Transformation.RESCALE_AREA:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.AREA)

            case self.Transformation.RESCALE_MITCHELLCUBIC:
                processed_image = tf.image.resize(processed_image,
                                                  size=model.input.shape[1:3],
                                                  method=tf.image.ResizeMethod.MITCHELLCUBIC)

            case _:
                assert False, 'Unknown transformation provided'

        return processed_image, model


class Interference(models.Model):
    architecture = models.ForeignKey(to=Architecture, related_name='interferences', on_delete=models.PROTECT)
    network_input = models.ForeignKey(to=NetworkInput, related_name='interferences', on_delete=models.PROTECT)
    transformation = models.CharField(choices=NetworkInput.Transformation)


class Prediction(models.Model):
    inference = models.ForeignKey(to=Interference, related_name='predictions', on_delete=models.CASCADE)
    # TODO: Validate order
    prediction_number = models.PositiveIntegerField()
    class_id = models.CharField(max_length=32)
    class_name = models.CharField(max_length=32)
    class_score = models.FloatField()


class Activation(models.Model):
    uuid = models.UUIDField(default=uuid4, unique=True, editable=False)
    inference = models.ForeignKey(to=Interference, related_name='activations', on_delete=models.CASCADE)
    layer = models.ForeignKey(to=Layer, related_name='activations', on_delete=models.PROTECT)
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
        assert len(activation.shape) == 3, f'{len(activation.shape)=} must be grayscale stream'

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

    def get_cache_key(self) -> str:
        return f':{self.id}:{self.binary_data_file.name}'

    def to_numpy(self) -> np.ndarray:
        texture_tensor = in_memory_cache.get(self.get_cache_key())
        if texture_tensor is None:
            texture_tensor = np.load(self.binary_data_file, allow_pickle=False)
            in_memory_cache.set(self.get_cache_key(), texture_tensor)

        return texture_tensor

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
