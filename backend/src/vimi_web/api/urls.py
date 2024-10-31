from django.urls import path, include

from vimi_web.api.views import ArchitectureAllView, UploadNetworkInput, NetworkInputProcess, ColorMapAllView, \
    ColorMapProcessView

urlpatterns = [
    # path('config/', include('vimi_web.config.urls')),
    path('authentication/', include('vimi_web.authentication.urls')),
    path('architecture/', ArchitectureAllView.as_view(), name='api_architecture_all'),
    path('network_input/', UploadNetworkInput.as_view(), name='api_upload_network_input'),
    path('color_map/', ColorMapAllView.as_view(), name='api_color_map'),
    path('color_map/process/', ColorMapProcessView.as_view(), name='api_color_map_process'),

    path('process/network_input/', NetworkInputProcess.as_view(), name='api_process_network_input'),
]
