from django.urls import path, include

from vimi_web.api.views import ArchitectureAllView, ModelDimensionsView

urlpatterns = [
    path('config/', include('vimi_web.config.urls')),
    path('authentication/', include('vimi_web.authentication.urls')),
    path('architecture/', ArchitectureAllView.as_view(), name='model_available_options'),

    path('model/dimensions/<int:architecture_id>/', ModelDimensionsView.as_view(), name='model_dimensions'),
]
