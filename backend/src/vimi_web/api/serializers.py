import cv2
import keras
import numpy as np
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, FileField, IntegerField

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activations


class ArchitectureAllSerializer(ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions',)


class UploadNetworkInputSerializer(Serializer):
    # TODO: Validate the file is not too big
    file = FileField(max_length=128)

    def create(self, validated_data) -> NetworkInput:
        instance = NetworkInput.objects.create(
            file=validated_data['file'],
        )
        instance.save()

        return instance


class NetworkInputProcessSerializer(Serializer):
    architecture = PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = PrimaryKeyRelatedField(queryset=NetworkInput.objects.all())
    layer_index = IntegerField(min_value=0)

    def validate(self, data):
        if data['layer_index'] >= len(data['architecture'].layers) \
            or data['layer_index'] >= len(data['architecture'].dimensions):
            raise ValidationError("layer_index is out of range for given architecture")

        return data

    def create(self, validated_data) -> Activations:
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
        activation_norm = np.rot90(activation_norm, -1, axes=(0, 1))

        instance = Activations.objects.create(
            activations_binary=activation_norm.tobytes(),
            shape=activation_norm.shape,
        )
        instance.save()

        return instance


class ColorMapAllSerializer(ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name',)


class ColorMapProcessSerializer(Serializer):
    activations = PrimaryKeyRelatedField(queryset=Activations.objects.all())
    color_map = PrimaryKeyRelatedField(queryset=ColorMap.objects.all())
    filter_index = IntegerField(min_value=0)

    def validate(self, data):
        _, _, z_size = data['activations'].to_numpy().shape

        if data['filter_index'] >= z_size:
            raise ValidationError("filter_index is out of range for given activations")

        return data
