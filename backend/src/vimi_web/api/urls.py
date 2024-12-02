from django.urls import path

from vimi_web.api import views

urlpatterns = [
    path('architecture/', views.ArchitectureAllView.as_view(), name='api-architecture-all'),
    path('architecture/processed/',
         view=views.ArchitectureProcessedAllView.as_view(),
         name='api-architecture-processed-all'),
    path('layers/',
         view=views.LayersByProcessedArchitectureView.as_view(),
         name='api-layers'),

    path('network_input/', views.NetworkInputView.as_view(), name='api-upload-network-input'),
    path('network_input/process/', views.NetworkInputProcessView.as_view(), name='api-network-input-process'),
    path('network_input/transformation/',
         view=views.NetworkInputTransformationAllView.as_view(),
         name='api-network-input-transformation'),

    path('color_map/', views.ColorMapAllView.as_view(), name='api-color-map'),
    path('color_map/process/', view=views.ColorMapProcessView.as_view(), name='api-color-map-process'),
    path('color_map/normalization/',
         view=views.ColorMapNormalizationAllView.as_view(),
         name='api-color-map-normalization'),
    path('color_map/indicator/',view=views.ColorMapIndicatorView.as_view(), name='api-color-map-indicator'),

    path('texture/', views.TextureView.as_view(), name='api-texture')
]
