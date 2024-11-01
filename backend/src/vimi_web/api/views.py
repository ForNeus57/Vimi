from base64 import b64encode

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.api.models import Architecture, ColorMap
from vimi_web.api.serializers import (
    ArchitectureAllSerializer,
    UploadNetworkInputSerializer,
    NetworkInputProcessSerializer,
    ColorMapAllSerializer,
    ColorMapProcessSerializer,
)


class ArchitectureAllView(APIView):
    permission_classes = (AllowAny,)
    queryset = Architecture.objects.all()
    serializer_class = ArchitectureAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class UploadNetworkInput(APIView):
    permission_classes = (AllowAny,)
    serializer_class = UploadNetworkInputSerializer
    parser_classes = (MultiPartParser, FormParser,)

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data={'file': request.FILES['file']})

        if serializer.is_valid():
            instance = serializer.save()
            return Response({'id': instance.id}, status=201)

        return Response(serializer.errors, status=400)


class NetworkInputProcess(APIView):
    permission_classes = (AllowAny,)
    serializer_class = NetworkInputProcessSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            instance = serializer.save()
            _, _, z_size = instance.shape

            return Response({'id': instance.id, 'filters_count': z_size}, status=201)

        return Response(serializer.errors, status=400)


class ColorMapAllView(APIView):
    permission_classes = (AllowAny,)
    queryset = ColorMap.objects.all()
    serializer_class = ColorMapAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class ColorMapProcessView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ColorMapProcessSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            activation = serializer.validated_data['activations']
            color_map = serializer.validated_data['color_map']
            filter_index = serializer.validated_data['filter_index']

            filter_activations = activation.to_numpy()[:, :, filter_index]
            filter_colored = color_map.apply_color_map(filter_activations)

            # response = {'activations': b64encode(filter_colored.tobytes()), 'shape': filter_colored.shape}
            response = {'activations': filter_colored.tolist()}
            return Response(response, status=200)

        return Response(serializer.errors, status=400)
