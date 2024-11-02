from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/1/", include("vimi_web.api.urls")),
    # path("worker/", include("vimi_web.worker.urls")),

    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]
