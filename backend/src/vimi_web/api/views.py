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
        except Exception as e:
            return Response({"error": str(e)}, status=400)


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

            model_caller = __import__(architecture.python_path)
            model = model_caller()

            total_layers = []
            for layer in model.layers:
                total_layers.append(layer.output_shape[1:])

            return Response(data=total_layers, status=200)

        return Response(serializer.errors, status=400)
