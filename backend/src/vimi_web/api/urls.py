from django.urls import path

from vimi_web.api import views

urlpatterns = [
    path('architecture/', views.ArchitectureAllView.as_view(), name='api-architecture-all'),

    path('network_input/', views.UploadNetworkInputView.as_view(), name='api-upload-network-input'),
    path('network_input/process/', views.NetworkInputProcessView.as_view(), name='api-network-input-process'),

    path('color_map/', views.ColorMapAllView.as_view(), name='api-color-map'),
    path('color_map/process/<uuid:activation>/<int:filter_index>/<int:color_map>/',
         view=views.ColorMapProcessView.as_view(),
         name='api-color-map-process'),

    path('activation/normalization/',
         view=views.ActivationNormalizationAllView.as_view(),
         name='api-activation-normalization'),
]
