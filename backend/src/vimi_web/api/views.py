"""All views for API Application"""
from uuid import UUID

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.api.models import Architecture, ColorMap
from vimi_web.api.renderers import TextureFileRenderer
from vimi_web.api.serializers import (
    ArchitectureAllSerializer,
    UploadNetworkInputSerializer,
    NetworkInputProcessSerializer,
    ColorMapAllSerializer,
    ColorMapProcessSerializer,
)


class ArchitectureAllView(APIView):
    """Returns all supported Neural-Network Architectures"""

    permission_classes = (AllowAny,)
    queryset = Architecture.objects.all()
    serializer_class = ArchitectureAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class UploadNetworkInputView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = UploadNetworkInputSerializer
    parser_classes = (MultiPartParser, FormParser,)

    def post(self, request: Request) -> Response:
        # TODO: change this so it uses ListSerializer and argument many=True and data=request.data
        serializer = self.serializer_class(data={'file': request.FILES['file']})

        if serializer.is_valid():
            instance = serializer.save()
            return Response({'id': instance.id}, status=201)

        return Response(serializer.errors, status=400)


class NetworkInputProcessView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = NetworkInputProcessSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            instance = serializer.save()

            return Response({'id': instance.id, 'filters_shape': instance.shape}, status=201)

        return Response(serializer.errors, status=400)


class ColorMapAllView(APIView):
    """Returns all supported Color Maps"""
    permission_classes = (AllowAny,)
    queryset = ColorMap.objects.all()
    serializer_class = ColorMapAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class ColorMapProcessView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ColorMapProcessSerializer
    renderer_classes = (TextureFileRenderer,)

    def get(self, request: Request, activation: UUID, filter_index: int, color_map: int) -> Response:
        serializer = self.serializer_class(data={
            'activation': activation,
            'filter_index': filter_index,
            'color_map': color_map,
        })

        if serializer.is_valid():
            activation = serializer.validated_data['activation']
            filter_index = serializer.validated_data['filter_index']
            color_map = serializer.validated_data['color_map']

            filter_activations = activation.to_numpy()[:, :, filter_index]
            filter_colored = color_map.apply_color_map(filter_activations)
            texture = ColorMap.get_generated_texture(filter_colored)

            return Response(texture.read(),
                            status=200,
                            headers={'Content-Disposition': f'attachment; filename="{texture.name}"'},
                            content_type='image/png')

        return Response(serializer.errors, status=400)
