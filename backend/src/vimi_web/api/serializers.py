from collections.abc import Mapping
from typing import Any, List, Tuple

import numpy as np
import keras
from django.core.files.base import ContentFile
from django.urls import reverse
from django.utils.http import urlencode
from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activation, Texture, Layer, Interference, \
    Prediction


# TODO: Consider splitting this two serializers into two views
class LayerSerializer(serializers.ModelSerializer):
    presentation_name = serializers.CharField(source='get_presentation_name', read_only=True)
    presentation_dimensions = serializers.CharField(source='get_presentation_dimensions', read_only=True)

    class Meta:
        model = Layer
        fields = ('uuid', 'layer_number', 'presentation_name', 'presentation_dimensions')


class ArchitectureAllSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(read_only=True, many=True)

    class Meta:
        model = Architecture
        fields = ('uuid', 'name', 'layers',)


class ArchitectureProcessedAllSerializer(serializers.ModelSerializer):
    layer_count = serializers.IntegerField(source='get_layer_count', read_only=True)

    class Meta:
        model = Architecture
        fields= ('uuid', 'name', 'layer_count')


class ArchitectureProcessedLayersSerializer(serializers.Serializer):
    architecture = serializers.SlugRelatedField(slug_field='uuid',
                                                queryset=Architecture.objects.all())


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
    transformation = serializers.ChoiceField(choices=NetworkInput.Transformation.choices)
    # TODO: Add validation with architecture
    layers = serializers.SlugRelatedField(slug_field='uuid',
                                          queryset=Layer.objects.all(),
                                          many=True)

    class Meta:
        model = Activation
        fields = ('architecture', 'network_input', 'transformation', 'layers')

    def create(self, validated_data: Mapping[str, Any]) -> Tuple[List[Prediction], List[Activation]]:
        architecture: Architecture = validated_data['architecture']
        network_input: NetworkInput = validated_data['network_input']
        transformation: NetworkInput.Transformation = validated_data['transformation']
        layers: List[Layer] = validated_data['layers']

        image, model = network_input.transform_input_adjust_model(architecture, transformation)
        decode_predictions = architecture.get_decode_predictions_function()

        layer_outputs = [model.output] + [model.get_layer(name=provided_layer.name).output for provided_layer in layers]
        activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
        model_predictions = activation_model.predict(image)

        inference = Interference(architecture=architecture,
                                 network_input=network_input,
                                 transformation=transformation)

        inference.save()
        predictions = Prediction.objects.bulk_create([
            Prediction(inference=inference,
                       prediction_number=index,
                       class_id=class_id,
                       class_name=class_name,
                       class_score=class_score)
            for index, (class_id, class_name, class_score) in enumerate(decode_predictions(model_predictions[0], 5)[0])
        ])
        activations = Activation.objects.bulk_create([
            Activation(inference=inference,
                       layer=layer,
                       activation_binary=Activation.to_file(activation[0]))
            for activation, layer in zip(model_predictions[1:], layers)
        ])
        return predictions, activations


class NetworkInputTransformationAllSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64)
    name = serializers.CharField(max_length=64)


class ColorMapAllSerializer(serializers.ModelSerializer):
    indicator = serializers.SerializerMethodField('get_indicator')

    class Meta:
        model = ColorMap
        fields = ('uuid', 'name', 'indicator')

    def get_indicator(self, obj) -> str:
        request = self.context.get('request')
        color_map_uuid = obj.uuid
        return request.build_absolute_uri(f'{reverse('api-color-map-indicator')}?{urlencode({
            'color_map': color_map_uuid,
        })}')


class ColorMapProcessSerializer(serializers.Serializer):
    activation = serializers.SlugRelatedField(slug_field='uuid',
                                              queryset=Activation.objects.all())
    color_map = serializers.SlugRelatedField(slug_field='uuid',
                                             queryset=ColorMap.objects.all())
    normalization = serializers.ChoiceField(choices=ColorMap.Normalization.choices)

    def create(self, validated_data: Mapping[str, Any]) -> Texture:
        activation: Activation = validated_data['activation']
        color_map: ColorMap = validated_data['color_map']
        normalization: ColorMap.Normalization = validated_data['normalization']

        activation_data = activation.to_numpy()
        normalized_data = color_map.normalize_activations(activation_data, normalization)
        activations_colored = color_map.apply_color_map(normalized_data)

        instance = Texture.objects.create(activation=activation,
                                          color_map=color_map,
                                          normalization=normalization,
                                          binary_data_file=Texture.to_file(activations_colored),
                                          shape=activations_colored.shape)
        instance.save()
        return instance


class ColorMapNormalizationAllSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=32)
    name = serializers.CharField(max_length=32)


class ColorMapIndicatorSerializer(serializers.Serializer):
    color_map = serializers.SlugRelatedField(slug_field='uuid',
                                             queryset=ColorMap.objects.all())

    def create(self, validated_data: Mapping[str, Any]) -> ContentFile:
        color_map: ColorMap = validated_data['color_map']

        base_array = np.arange(255, -1, -1, dtype=np.uint8)
        expanded_repeated_array = np.expand_dims(base_array, axis=1)
        repeated_expanded_array = np.repeat(expanded_repeated_array, repeats=16, axis=1)
        input_vector = np.expand_dims(repeated_expanded_array, axis=2)

        return Texture().get_file(color_map.apply_color_map(input_vector)[:, :, :, 0], 9)



class TextureSerializer(serializers.Serializer):
    texture = serializers.SlugRelatedField(slug_field='uuid',
                                           queryset=Texture.objects.all())
    # TODO: Validate this field
    filter_index = serializers.IntegerField(min_value=0)
    cube_side = serializers.ChoiceField(choices=Texture.CubeSide.choices)
    compression_level = serializers.IntegerField(min_value=0, max_value=9)

    def create(self, validated_data: Mapping[str, Any]) -> ContentFile:
        texture: Texture = validated_data['texture']
        filter_index = validated_data['filter_index']
        cube_size = validated_data['cube_side']
        compression_level = validated_data['cube_side']

        filter_slice = texture.get_slice(filter_index, cube_size)
        return texture.get_file(filter_slice, compression_level)


