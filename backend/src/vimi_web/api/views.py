import cv2
import keras
import numpy as np

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from vimi_web.api.models import Architecture, NetworkInput
from vimi_web.api.serializers import (
    ArchitectureAllSerializer,
    UploadNetworkInputSerializer,
    ProcessNetworkInputSerializer,
)


# class LogoutView(APIView):
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request: Request) -> Response:
#         try:
#             refresh_token = request.data["refresh_token"]
#             token = RefreshToken(refresh_token)
#             # RedisTokenBlacklist.add(token.access_token)
#             token.blacklist()
#
#             return Response({"message": "Successfully logged out."}, status=200)
#         except Exception as error:
#             return Response({"error": str(error)}, status=400)


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
            network_input = serializer.save()

            return Response({'uuid': network_input.uuid}, status=201)

        return Response(serializer.errors, status=400)


class ProcessNetworkInput(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ProcessNetworkInputSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            uuid = serializer.validated_data.get('uuid')
            architecture = serializer.validated_data.get('architecture')
            layer_index = serializer.validated_data.get('layer_index')

            # TODO: Fix this so the serializer handles this case automatically
            network_input = NetworkInput.objects.filter(uuid=uuid).first()
            if network_input is None:
                return Response({'errors': 'uuid do not correspond to any file'}, status=400)

            model = architecture.get_model()

            image = cv2.imread(network_input.file.path, cv2.IMREAD_COLOR) / 255.
            image = cv2.resize(image, model.input_shape[1: 3], interpolation=cv2.INTER_CUBIC)
            image = np.expand_dims(image, axis=0)

            layer_outputs = [layer.output for layer in model.layers[:layer_index]]
            activation_model = keras.Model(inputs=model.input, outputs=layer_outputs)
            activations = activation_model.predict(image)

            activation_norm = (activations[-1] - np.min(activations[-1], axis=(1, 2)))[0, :, :, :]
            point_to_point = np.ptp(activation_norm, axis=(0, 1))
            point_to_point[point_to_point == 0.] = 1.
            activation_norm /= point_to_point
            activation_norm = np.rot90(activation_norm, -1, axes=(0, 1))

            return Response({"output": activation_norm.tolist()}, status=200)

        return Response(serializer.errors, status=400)
