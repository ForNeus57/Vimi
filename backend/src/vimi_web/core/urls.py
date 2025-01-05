from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/1/', include('vimi_web.api.urls')),
    # path('authentication/', include('vimi_web.authentication.urls')),
    # path('config/', include('vimi_web.config.urls')),

    # *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]
