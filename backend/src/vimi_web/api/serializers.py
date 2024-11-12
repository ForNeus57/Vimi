from collections.abc import Mapping
from typing import Any

import cv2
import keras
import numpy as np
from django.core.files.base import ContentFile
from rest_framework.exceptions import ValidationError
from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activation, Texture, Layer


# TODO: Consider splitting this two serializers into two views
class LayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Layer
        fields = ('uuid', 'order', 'name',)


class ArchitectureAllSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(many=True)

    class Meta:
        model = Architecture
        fields = ('uuid', 'name', 'layers',)


class NetworkInputSerializer(serializers.Serializer):
    # TODO: Validate the file is not too big
    file = serializers.FileField(max_length=128)

    def create(self, validated_data: Mapping[str, Any]) -> NetworkInput:
        instance = NetworkInput.objects.create(file=validated_data['file'])
        instance.save()
        return instance


class NetworkInputProcessSerializer(serializers.ModelSerializer):
    architecture = serializers.SlugRelatedField(slug_field='uuid',
                                                queryset=Architecture.objects.all())
    network_input = serializers.SlugRelatedField(slug_field='uuid',
                                                 queryset=NetworkInput.objects.all())
    layer_index = serializers.IntegerField(min_value=0)
    normalization = serializers.ChoiceField(choices=Activation.Normalization.choices)

    class Meta:
        model = Activation
        fields = ('normalization', 'architecture', 'network_input', 'layer_index',)

    def validate(self, data: Mapping[str, Any]) -> Mapping[str, Any]:
        if data['layer_index'] >= len(data['architecture'].layers) \
            or data['layer_index'] >= len(data['architecture'].dimensions):
            raise ValidationError("layer_index is out of range for given architecture")

        return data

    def create(self, validated_data: Mapping[str, Any]) -> Activation:
        architecture = validated_data['architecture']
        network_input = validated_data['network_input']
        layer_index = validated_data['layer_index']
        normalization = validated_data['normalization']

        image = cv2.imread(network_input.file.path, cv2.IMREAD_COLOR) / 255
        model = architecture.get_model(image.shape)
        image = np.expand_dims(image, axis=0)
        layer_outputs = [layer.output for layer in model.layers[:layer_index]]
        activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
        activation = activation_model.predict(image)
        activation = activation[-1][0]

        match normalization:
            case Activation.Normalization.LOCAL:
                maximum = np.max(activation)
                activation_norm = (activation - np.min(activation)) / maximum

            case Activation.Normalization.GLOBAL:
                maximum = np.max(activation, axis=(0, 1))
                maximum[maximum == 0.] = 1.
                activation_norm = (activation - np.min(activation, axis=(0, 1))) / maximum

            case _:
                assert False, 'Unknown normalization method provided'

        activation_norm = (activation_norm * 255.).astype(np.uint8)

        instance = Activation.objects.create(architecture=architecture,
                                             network_input=network_input,
                                             activation_binary=Activation.to_file(activation_norm),
                                             normalization=normalization)
        instance.save()
        return instance


class ActivationNormalizationAllSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=32)
    name = serializers.CharField(max_length=32)


class ActivationInputTransformationAllSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64)
    name = serializers.CharField(max_length=64)


class ColorMapAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('uuid', 'name',)


class ColorMapProcessSerializer(serializers.Serializer):
    activation = serializers.SlugRelatedField(slug_field='uuid',
                                              queryset=Activation.objects.all())
    color_map = serializers.SlugRelatedField(slug_field='uuid',
                                             queryset=ColorMap.objects.all())

    def create(self, validated_data: Mapping[str, Any]) -> Texture:
        activation = validated_data['activation']
        color_map = validated_data['color_map']

        activation_data = activation.to_numpy()
        activations_colored = color_map.apply_color_map(activation_data)

        instance = Texture.objects.create(activation=activation,
                                          color_map=color_map,
                                          binary_data_file=Texture.to_file(activations_colored),
                                          shape=activations_colored.shape)
        instance.save()
        return instance


class TextureSerializer(serializers.Serializer):
    texture = serializers.SlugRelatedField(slug_field='uuid',
                                           queryset=Texture.objects.all())
    # TODO: Validate this field
    filter_index = serializers.IntegerField(min_value=0)
    cube_side = serializers.ChoiceField(choices=Texture.CubeSide.choices)
    quality = serializers.IntegerField(min_value=1, max_value=16)
    compression_level = serializers.IntegerField(min_value=0, max_value=9)

    def create(self, validated_data: Mapping[str, Any]) -> ContentFile:
        texture = validated_data['texture']
        filter_index = validated_data['filter_index']
        cube_size = validated_data['cube_side']
        quality = validated_data['quality']
        compression_level = validated_data['cube_side']

        filter_slice = texture.get_slice(filter_index, cube_size, quality)
        return texture.get_file(filter_slice, compression_level)


