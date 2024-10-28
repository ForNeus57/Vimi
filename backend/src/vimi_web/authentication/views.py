from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.authentication.serializers import RegisterUserSerializer


class RegisterUser(APIView):
    permission_classes = [AllowAny,]
    serializer_class = RegisterUserSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(status=201)

        return Response(serializer.errors, status=400)
