from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.authentication.serializers import RegisterUserSerializer


class RegisterUser(APIView):
    serializer_class = RegisterUserSerializer
    permission_classes = [AllowAny,]

    def post(self, request) -> Response:
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=201)

        return Response(serializer.errors, status=400)
