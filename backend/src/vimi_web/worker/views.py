from django.db.utils import IntegrityError
from django.http import HttpRequest
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.worker.models import Machine


class Register(APIView):
    permission_classes = [AllowAny]

    def post(self, request: HttpRequest) -> Response:
        if not hasattr(request, "data"):
            return Response({"error": "No data provided"}, status=400)

        try:
            worker = Machine.objects.create(base_url=request.data["base_url"])
        except IntegrityError as error:
            return Response({"error": "Invalid data", "details": str(error)}, status=400)

        if worker is None:
            return Response({"error": "Invalid data"}, status=400)

        return Response({
            "status": "Worker registered",
            "id": worker.id,
        })