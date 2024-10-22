from django.urls import path, include

from vimi_web.api.views import ArchitectureAllView, UploadNetworkInput, ProcessNetworkInput

urlpatterns = [
    # path('config/', include('vimi_web.config.urls')),
    path('authentication/', include('vimi_web.authentication.urls')),
    path('architecture/', ArchitectureAllView.as_view(), name='architecture_all'),
    path('network_input/', UploadNetworkInput.as_view(), name='upload_network_input'),
    path('process/network_input/', ProcessNetworkInput.as_view(), name='process_network_input'),
    # path('model/dimensions/<int:architecture_id>/', ModelDimensionsView.as_view(), name='model_dimensions'),
    # path('model/preview/<int:architecture_id>/', ModelPreviewView.as_view(), name='model_preview'),
]
