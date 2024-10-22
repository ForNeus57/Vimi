from platform import architecture

from rest_framework import serializers

from vimi_web.api.models import Architecture, NetworkInput


class ArchitectureAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Architecture
        fields = ['id', 'name', 'layers', 'dimensions']


class UploadNetworkInputSerializer(serializers.Serializer):
    architecture = serializers.PrimaryKeyRelatedField(queryset=Architecture.objects.all())
    file = serializers.FileField(max_length=1024)

    def create(self, validated_data):
        network_input =  NetworkInput.objects.create(
            architecture=validated_data['architecture'],
            file=validated_data['file'],
        )

        network_input.save()

        return network_input


class ProcessNetworkInputSerializer(serializers.Serializer):
    uuid = serializers.UUIDField()
    layer_index = serializers.IntegerField(min_value=0)