from collections.abc import Mapping
from typing import Any

import cv2
import keras
import numpy as np
from rest_framework.exceptions import ValidationError
from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activation


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions',)


class UploadNetworkInputSerializer(serializers.Serializer):
    # TODO: Validate the file is not too big
    file = serializers.FileField(max_length=128)

    def create(self, validated_data: Mapping[str, Any]) -> NetworkInput:
        instance = NetworkInput.objects.create(file=validated_data['file'])
        instance.save()

        return instance


class NetworkInputProcessSerializer(serializers.ModelSerializer):
    architecture = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    network_input = serializers.PrimaryKeyRelatedField(queryset=NetworkInput.objects.all())
    layer_index = serializers.IntegerField(min_value=0)

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
                maximum[maximum == 0.] = 1.
                activation_norm = (activation - np.min(activation)) / maximum

            case Activation.Normalization.GLOBAL:
                maximum = np.max(activation, axis=(0, 1))
                maximum[maximum == 0.] = 1.
                activation_norm = (activation - np.min(activation, axis=(0, 1))) / maximum

            case _:
                assert False, 'Unknown normalization method provided'

        activation_norm = (activation_norm * 255.).astype(np.uint8)

        instance = Activation.objects.create(activation_binary=activation_norm.tobytes(),
                                             shape=activation_norm.shape,
                                             normalization=normalization)
        instance.save()

        return instance


class ColorMapAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name',)


class ColorMapProcessSerializer(serializers.Serializer):
    activation = serializers.PrimaryKeyRelatedField(queryset=Activation.objects.all())
    filter_index = serializers.IntegerField(min_value=0)
    color_map = serializers.PrimaryKeyRelatedField(queryset=ColorMap.objects.all())

    def validate(self, data: Mapping[str, Any]) -> Mapping[str, Any]:
        _, _, z_size = data['activation'].to_numpy().shape

        if data['filter_index'] >= z_size:
            raise ValidationError("filter_index is out of range for given activations")

        return data


class ActivationNormalizationAllSerializer(serializers.Serializer):
    id = serializers.IntegerField(min_value=0)
    name = serializers.CharField(max_length=32)
