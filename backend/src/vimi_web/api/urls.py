from django.urls import path, include

from vimi_web.api.views import ArchitectureAllView, ModelDimensionsView, ModelPreviewView

urlpatterns = [
    path('config/', include('vimi_web.config.urls')),
    path('authentication/', include('vimi_web.authentication.urls')),
    path('architecture/', ArchitectureAllView.as_view(), name='model_architecture_all'),

    path('model/dimensions/<int:architecture_id>/', ModelDimensionsView.as_view(), name='model_dimensions'),
    path('model/preview/<int:architecture_id>/', ModelPreviewView.as_view(), name='model_preview'),
]
