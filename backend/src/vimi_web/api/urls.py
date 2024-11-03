from django.urls import path

from vimi_web.api import views

urlpatterns = [
    path('architecture/', views.ArchitectureAllView.as_view(), name='api_architecture_all'),

    path('network_input/', views.UploadNetworkInput.as_view(), name='api_upload_network_input'),
    path('network_input/process/', views.NetworkInputProcess.as_view(), name='api_network_input_process'),

    path('color_map/', views.ColorMapAllView.as_view(), name='api_color_map'),
    path('color_map/process/', views.ColorMapProcessView.as_view(), name='api_color_map_process'),
]
