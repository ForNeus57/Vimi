import asyncio
from importlib import import_module
from typing import Any, Dict

from django.http import StreamingHttpResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser

from vimi_web.api.models import Architecture
from vimi_web.api.serializers import ArchitectureAllSerializer, ModelDimensionsSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated,]

    def post(self, request: Request) -> Response:
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            # RedisTokenBlacklist.add(token.access_token)
            token.blacklist()

            return Response({"message": "Successfully logged out."}, status=200)
        except Exception as error:
            return Response({"error": str(error)}, status=400)


class ArchitectureAllView(APIView):
    permission_classes = [AllowAny,]
    queryset = Architecture.objects.all()
    serializer_class = ArchitectureAllSerializer

    def get(self, request: Request) -> Response:
        result = self.serializer_class(self.queryset.all(), many=True)

        return Response(result.data, status=200)


class ModelDimensionsView(APIView):
    permission_classes = [AllowAny,]
    queryset = Architecture.objects.all()
    serializer_class = ModelDimensionsSerializer
    parser_classes = [MultiPartParser, FormParser,]

    def post(self, request: Request, architecture_id: int) -> Response:
        serializer = self.serializer_class(data={'file': request.FILES['file'], 'id': architecture_id})
        if serializer.is_valid():
            file = serializer.validated_data.get('file')
            architecture = serializer.validated_data.get('id')

            module = import_module(architecture.module)
            model_caller = getattr(module, architecture.name)
            model = model_caller()

            total_layers = [model.input_shape[1:]]
            for layer in model.layers[1:]:
                total_layers.append(layer.output.shape[1:])

            return Response(data=total_layers, status=200)

        return Response(serializer.errors, status=400)


class ModelPreviewView(APIView):
    permission_classes = [AllowAny,]
    queryset = Architecture.objects.all()
    serializer_class = ModelDimensionsSerializer
    parser_classes = [MultiPartParser, FormParser,]

    def post(self, request: Request, architecture_id: int) -> Response | StreamingHttpResponse:
        serializer = self.serializer_class(data={'file': request.FILES['file'], 'id': architecture_id})
        if serializer.is_valid():
            file = serializer.validated_data.get('file')
            architecture = serializer.validated_data.get('id')

            module = import_module(architecture.module)
            model_caller = getattr(module, architecture.name)
            model = model_caller()

            async def generate_layers_preview():
                for layer in model.layers:
                    yield layer.summary()

            return StreamingHttpResponse(asyncio.coroutine(generate_layers_preview)(), content_type='text/event-stream')

        return Response(serializer.errors, status=400)
