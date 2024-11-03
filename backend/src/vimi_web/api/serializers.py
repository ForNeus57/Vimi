from collections.abc import Mapping
from typing import Any

import cv2
import keras
import numpy as np
from rest_framework.exceptions import ValidationError
from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activation, Texture


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions',)


class UploadNetworkInputSerializer(serializers.Serializer):
    # TODO: Validate the file is not too big
    file = serializers.FileField(max_length=128)

    def create(self, validated_data: Mapping[str, Any]) -> NetworkInput:
        instance = NetworkInput.objects.create(
            file=validated_data['file'],
        )
        instance.save()

        return instance


class NetworkInputProcessSerializer(serializers.Serializer):
    architecture = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = serializers.PrimaryKeyRelatedField(queryset=NetworkInput.objects.all())
    layer_index = serializers.IntegerField(min_value=0)

    def validate(self, data: Mapping[str, Any]) -> Mapping[str, Any]:
        if data['layer_index'] >= len(data['architecture'].layers) \
            or data['layer_index'] >= len(data['architecture'].dimensions):
            raise ValidationError("layer_index is out of range for given architecture")

        return data

    def create(self, validated_data: Mapping[str, Any]) -> Activation:
        architecture = validated_data['architecture']
        file = validated_data['file']
        layer_index = validated_data['layer_index']

        model = architecture.get_model()

        # TODO: Remove rescaling in favour of creating custom input tensor as in keras applications documentation
        image = cv2.imread(file.file.path, cv2.IMREAD_COLOR) / 255
        assert image is not None, 'image cannot be obtained'
        image = cv2.resize(image, model.input.shape[1: 3], interpolation=cv2.INTER_CUBIC)
        image = np.expand_dims(image, axis=0)

        layer_outputs = [layer.output for layer in model.layers[:layer_index]]
        activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
        activations = activation_model.predict(image)
        activations = activations[-1][0]

        activation_norm = (activations - np.min(activations)) / np.max(activations)
        activation_norm = (activation_norm * 255.).astype(np.uint8)

        instance = Activation.objects.create(
            activation_binary=activation_norm.tobytes(),
            shape=activation_norm.shape,
        )
        instance.save()

        return instance


class ColorMapAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name',)


class ColorMapProcessSerializer(serializers.Serializer):
    activations = serializers.PrimaryKeyRelatedField(queryset=Activation.objects.all())
    color_map = serializers.PrimaryKeyRelatedField(queryset=ColorMap.objects.all())
    filter_index = serializers.IntegerField(min_value=0)

    def validate(self, data: Mapping[str, Any]) -> Mapping[str, Any]:
        _, _, z_size = data['activations'].to_numpy().shape

        if data['filter_index'] >= z_size:
            raise ValidationError("filter_index is out of range for given activations")

        return data

    def create(self, validated_data: Mapping[str, Any]) -> Texture:
        activation = validated_data['activations']
        color_map = validated_data['color_map']
        filter_index = validated_data['filter_index']

        filter_activations = activation.to_numpy()[:, :, filter_index]
        filter_colored = color_map.apply_color_map(filter_activations)

        image = Texture.to_image(filter_colored)
        instance = Texture.objects.create(
            texture_image=image,
            shape=filter_colored.shape,
        )
        instance.save()

        # TODO:  just return it for god say
        return instance
