from importlib import import_module

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from vimi_web.api.models import Architecture
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

    def post(self, request: Request, architecture_id: int) -> Response:
        serializer = self.serializer_class(data={'architecture': architecture_id, 'file': request.FILES['file']})

        if serializer.is_valid():
            network_input = serializer.save()

            return Response({'uuid': network_input.uuid}, status=201)

        return Response(serializer.errors, status=400)


class ProcessNetworkInput(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ProcessNetworkInputSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class()

        if serializer.is_valid():

            return Response({'output': []}, status=201)

        return Response(serializer.errors, status=400)
