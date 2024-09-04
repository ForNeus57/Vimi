from django.urls import path, include

from vimi_web.worker import views

urlpatterns = [
    path("register/", views.Register.as_view(), name="register"),
]
