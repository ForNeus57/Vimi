import hashlib
from collections.abc import Mapping
from typing import Any, List, Tuple, Dict

import numpy as np
import keras
from django.core.files.base import ContentFile
from django.urls import reverse
from django.utils.http import urlencode
from rest_framework import serializers

from vimi_lib.data.arr import ensure_3d
from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activation, Texture, Layer, Interference, \
    Prediction


# TODO: Consider splitting this two serializers into two views
class LayerSerializer(serializers.ModelSerializer):
    presentation_name = serializers.CharField(source='get_presentation_name', read_only=True)
    presentation_dimensions = serializers.CharField(source='get_presentation_dimensions', read_only=True)

    class Meta:
        model = Layer
        fields = ('uuid', 'layer_number', 'presentation_name', 'presentation_dimensions')


class LayersByProcessedArchitectureSerializer(serializers.Serializer):
    processed_architecture = serializers.SlugRelatedField(slug_field='uuid',
                                                          queryset=Architecture.objects.filter(id__in=Interference.objects.values('architecture_id')).distinct())


class ArchitectureAllSerializer(serializers.ModelSerializer):
    layers = LayerSerializer(read_only=True, many=True)

    class Meta:
        model = Architecture
        fields = ('uuid', 'name', 'layers',)


class ArchitectureProcessedAllSerializer(serializers.ModelSerializer):
    layer_count = serializers.IntegerField(source='get_layer_count', read_only=True)

    class Meta:
        model = Architecture
        fields = ('uuid', 'name', 'layer_count')


class NetworkInputSerializer(serializers.ModelSerializer):
    filename = serializers.CharField(source='get_base_filename', read_only=True)
    interferences = serializers.SlugRelatedField(slug_field='transformation',
                                                 read_only=True,
                                                 many=True)

    class Meta:
        model = NetworkInput
        fields = ('uuid', 'filename', 'interferences')


class NetworkInputCreateSerializer(serializers.Serializer):
    # TODO: Validate the file is not too big
    file = serializers.FileField(max_length=128)

    def create(self, validated_data: Mapping[str, Any]) -> NetworkInput:
        sha256_alg = hashlib.sha256()
        for chunk in validated_data['file'].chunks():
            sha256_alg.update(chunk)

        file_sha256_hash = sha256_alg.digest()
        if (queryset := NetworkInput.objects.filter(sha256_hash=file_sha256_hash)).exists():
            return queryset.first()

        instance = NetworkInput.objects.create(file=validated_data['file'],
                                               sha256_hash=file_sha256_hash)
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

    def create(self, validated_data: Mapping[str, Any]) -> Tuple:
        architecture: Architecture = validated_data['architecture']
        network_input: NetworkInput = validated_data['network_input']
        transformation: NetworkInput.Transformation = validated_data['transformation']
        layers: List[Layer] = validated_data['layers']

        image, model = network_input.transform_input_adjust_model(architecture, transformation)
        decode_predictions = architecture.get_decode_predictions_function()

        layer_outputs = [model.output] + [model.get_layer(name=provided_layer.name).output for provided_layer in layers]
        activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
        model_predictions = activation_model.predict(image)

        if (queryset := Interference.objects.filter(architecture=architecture,
                                                    network_input=network_input,
                                                    transformation=transformation)).exists():
            inference = queryset.first()
            predictions = list(Prediction.objects.filter(inference=inference))
        else:
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

        computed_activations = Activation.objects.filter(layer__in=layers, inference=inference)

        activations = Activation.objects.bulk_create([
            Activation(inference=inference,
                       layer=layer,
                       activation_binary=Activation.to_file(ensure_3d(activation[0])))
            for activation, layer in zip(model_predictions[1:], layers)
            if not computed_activations.filter(layer=layer).exists()
        ])

        activations = computed_activations.union(Activation.objects.filter(id__in=map(lambda x: x.id,
                                                                                      activations))).order_by('id')

        return predictions, activations


class NetworkInputTransformationAllSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64)
    name = serializers.CharField(max_length=64)


class ActivationByLayerSerializer(serializers.Serializer):
    processed_layer = serializers.SlugRelatedField(slug_field='uuid',
                                                   queryset=Layer.objects.all())


class ActivationSerializer(serializers.ModelSerializer):
    presentation_name = serializers.CharField(source='get_presentation_name')

    class Meta:
        model = Activation
        fields = ('uuid', 'presentation_name',)


class ActivationCompareSerializer(serializers.Serializer):
    # TODO: Validation
    first_activation = serializers.SlugRelatedField(slug_field='uuid',
                                                    queryset=Activation.objects.all())
    second_activation = serializers.SlugRelatedField(slug_field='uuid',
                                                     queryset=Activation.objects.all())
    filter_index = serializers.IntegerField(min_value=0)
    normalization = serializers.ChoiceField(choices=ColorMap.Normalization.choices)
    color_map = serializers.SlugRelatedField(slug_field='uuid',
                                             queryset=ColorMap.objects.all())

    def create(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        first_activation: Activation = validated_data['first_activation']
        second_activation: Activation = validated_data['second_activation']
        filter_index: int = validated_data['filter_index']
        normalization: ColorMap.Normalization = validated_data['normalization']
        color_map: ColorMap = validated_data['color_map']
        request = self.context.get('request')

        prediction_1 = Prediction.objects.filter(inference=first_activation.inference).values('prediction_number', 'class_name', 'class_score')
        prediction_2 = Prediction.objects.filter(inference=second_activation.inference).values('prediction_number', 'class_name', 'class_score')

        image_1 = first_activation.to_numpy()[:, :, filter_index]
        image_2 = second_activation.to_numpy()[:, :, filter_index]

        mse = keras.metrics.MeanSquaredError()
        mae = keras.metrics.MeanAbsoluteError()

        mse.update_state(first_activation.to_numpy(), second_activation.to_numpy())
        mae.update_state(first_activation.to_numpy(), second_activation.to_numpy())


        normalized_data = color_map.normalize_activations(np.expand_dims(image_1, axis=-1), normalization)
        activations_colored = color_map.apply_color_map(normalized_data)

        texture_1 = Texture.objects.create(activation=first_activation,
                                          color_map=color_map,
                                          normalization=normalization,
                                          binary_data_file=Texture.to_file(activations_colored),
                                          shape=activations_colored.shape)
        texture_1.save()

        normalized_data = color_map.normalize_activations(np.expand_dims(image_2, axis=-1), normalization)
        activations_colored = color_map.apply_color_map(normalized_data)

        texture_2 = Texture.objects.create(activation=second_activation,
                                          color_map=color_map,
                                          normalization=normalization,
                                          binary_data_file=Texture.to_file(activations_colored),
                                          shape=activations_colored.shape)
        texture_2.save()

        return {
            'image0': texture_1.get_available_urls(request)[0][Texture.CubeSide.POS_Z],
            'image1': texture_2.get_available_urls(request)[0][Texture.CubeSide.POS_Z],
            'classes0': prediction_1,
            'classes1': prediction_2,
            'metrics': {
                'mse': mse.result().numpy().item(),
                'mae': mae.result().numpy().item(),
            },
        }


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
