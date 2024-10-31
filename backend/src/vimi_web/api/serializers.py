import cv2
import keras
import numpy as np
from rest_framework.serializers import Serializer, ModelSerializer, PrimaryKeyRelatedField, FileField, IntegerField

from vimi_web.api.models import Architecture, NetworkInput, ColorMap, Activations


class ArchitectureAllSerializer(ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions',)


class ColorMapAllSerializer(ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name',)


class ColorMapProcessSerializer(Serializer):
    activations = PrimaryKeyRelatedField(queryset=Activations.objects.all())
    color_map = PrimaryKeyRelatedField(queryset=ColorMap.objects.all())


class UploadNetworkInputSerializer(Serializer):
    # TODO: Validate the file is not too big
    file = FileField(max_length=128)

    def create(self, validated_data):
        instance = NetworkInput.objects.create(file=validated_data['file'])
        instance.save()

        return {'id': instance.id}


class NetworkInputProcessSerializer(Serializer):
    architecture = PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = PrimaryKeyRelatedField(queryset=NetworkInput.objects.all())
    layer_index = IntegerField(min_value=0)

    def create(self, validated_data):
        architecture = validated_data.get('architecture')
        file = validated_data.get('file')
        layer_index = validated_data.get('layer_index')

        model = architecture.get_model()

        # TODO: Remove rescaling in favour of creating custom input tensor as in keras applications documentation
        image = cv2.imread(file.file.path, cv2.IMREAD_COLOR) / 255
        image = cv2.resize(image, model.input_shape[1: 3], interpolation=cv2.INTER_CUBIC)
        image = np.expand_dims(image, axis=0)

        layer_outputs = [layer.output for layer in model.layers[:layer_index]]
        activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
        activations = activation_model.predict(image)
        activations = activations[-1][0]

        activation_norm = activations - np.min(activations, axis=(0, 1))
        point_to_point = np.ptp(activation_norm, axis=(0, 1))
        point_to_point[point_to_point == 0.] = 1.                  # Prevent NaN from accounting via division by 0
        activation_norm /= point_to_point
        activation_norm = (activation_norm * 255).astype(np.uint8)
        activation_norm = np.rot90(activation_norm, -1, axes=(0, 1))

        # result = np.zeros(shape=(activation_norm.shape + (3,)), dtype=np.uint8)
        # x_size, _, _ = activation_norm.shape
        # for index in range(x_size):
        #     result[index] = color_map.apply_color_map(activation_norm[index])

        result = []
        _, _, z_size = activation_norm.shape

        for idx in range(z_size):
            current_filter = activation_norm[:, :, idx]

            instance = Activations.objects.create(
                activations_binary=current_filter.tobytes(),
                shape=current_filter.shape
            )
            instance.save()

            result.append({
                'id': instance.id,
                'order': idx,
            })

        return {'activations': result}
