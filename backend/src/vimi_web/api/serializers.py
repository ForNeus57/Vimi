from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput, ColorMap


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ('id', 'name', 'layers', 'dimensions',)


class ColorMapAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColorMap
        fields = ('id', 'name',)


class UploadNetworkInputSerializer(serializers.Serializer):
    file = serializers.FileField(max_length=128)

    def create(self, validated_data):
        instance = NetworkInput.objects.create(file=validated_data['file'])
        instance.save()

        return {'id': instance.id}


class ProcessNetworkInputSerializer(serializers.Serializer):
    architecture = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = serializers.PrimaryKeyRelatedField(queryset=NetworkInput.objects.all())
    color_map = serializers.PrimaryKeyRelatedField(queryset=ColorMap.objects.all())
    layer_index = serializers.IntegerField(min_value=0)
