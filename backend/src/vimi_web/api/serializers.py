from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions')


class ColorMapAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name')


class UploadNetworkInputSerializer(serializers.Serializer):
    file = serializers.FileField(max_length=128)

    def create(self, validated_data):
        network_input = NetworkInput.objects.create(file=validated_data['file'])
        network_input.save()

        return network_input


class ProcessNetworkInputSerializer(serializers.Serializer):
    uuid = serializers.UUIDField()
    architecture = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    layer_index = serializers.IntegerField(min_value=0)
