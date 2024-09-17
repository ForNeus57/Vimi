from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/1/", include("vimi_web.api.urls")),
    # path("worker/", include("vimi_web.worker.urls")),
]
