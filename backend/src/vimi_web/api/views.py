from uuid import UUID

import cv2
import keras
import numpy as np
from django.core.files import File
from django.http import Http404
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.api.models import Architecture, NetworkInput, ColorMap
from vimi_web.api.serializers import (
    ArchitectureAllSerializer,
    UploadNetworkInputSerializer,
    ProcessNetworkInputSerializer,
    ColorMapAllSerializer,
)


class ArchitectureAllView(APIView):
    permission_classes = (AllowAny,)
    queryset = Architecture.objects.all()
    serializer_class = ArchitectureAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class ColorMapAllView(APIView):
    permission_classes = (AllowAny,)
    queryset = ColorMap.objects.all()
    serializer_class = ColorMapAllSerializer

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
            response_data = serializer.save()
            return Response(response_data, status=201)

        return Response(serializer.errors, status=400)


class ProcessNetworkInput(APIView):
    permission_classes = (AllowAny,)
    queryset = NetworkInput.objects.all()
    serializer_class = ProcessNetworkInputSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            architecture = serializer.validated_data.get('architecture')
            file = serializer.validated_data.get('file')
            color_map = serializer.validated_data.get('color_map')
            layer_index = serializer.validated_data.get('layer_index')

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
            point_to_point[point_to_point == 0.] = 1.               # Prevent NaN from accounting via division by 0
            activation_norm /= point_to_point
            activation_norm = (activation_norm * 255).astype(np.uint8)
            activation_norm = np.rot90(activation_norm, -1, axes=(0, 1))
            activation_norm = np.transpose(activation_norm, [2, 0, 1])

            result = np.zeros(shape=(activation_norm.shape + (3,)), dtype=np.uint8)
            x_size, _, _ = activation_norm.shape
            for index in range(x_size):
                result[index] = color_map.apply_color_map(activation_norm[index])

            return Response({"output": result.tolist()}, status=200)

        return Response(serializer.errors, status=400)
