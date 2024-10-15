from rest_framework import serializers

from vimi_web.api.models import Architecture


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ['id', 'name', 'layers', 'dimensions']


class ModelDimensionsSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = serializers.FileField(max_length=1024)
