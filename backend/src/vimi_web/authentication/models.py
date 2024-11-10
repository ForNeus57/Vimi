from uuid import uuid4

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserDetail(models.Model):
    id = models.UUIDField(default=uuid4, editable=False, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
