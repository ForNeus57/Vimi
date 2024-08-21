from contextvars import Token

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class GetJWTView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class RefreshJWTView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class VerifyJWTView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

class BlacklistJWTView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        return Response({}, status=status.HTTP_400_BAD_REQUEST)