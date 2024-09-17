from typing import Callable

from django.core.exceptions import SuspiciousOperation
from django.http import HttpRequest, HttpResponse


class MaxUploadSizeMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        max_upload_size: int = max(16 * 1024 * 1024, 0) # TODO: LATER CHANGE TO TAKE MAX AS A TOTAL.

        if request.method == "POST" and request.META.get('CONTENT_LENGTH'):
            if int(request.META['CONTENT_LENGTH']) > max_upload_size:
                raise SuspiciousOperation(
                    f"File size exceeds the maximum allowed size of {max_upload_size / (1024 * 1024)}MB"
                )

        response = self.get_response(request)
        return response

class CorsMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        response['Access-Control-Allow-Origin'] = '*'
        # response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

        return response
