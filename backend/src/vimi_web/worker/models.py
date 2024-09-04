import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Machine(models.Model):
    # name = models.CharField(max_length=100)
    # description = models.CharField(max_length=100)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    base_url = models.CharField(max_length=256, unique=True)


class Action(models.Model):
    class ActionType(models.TextChoices):
        GET_SIZE = "GET_SIZE", "Get size"
        CALCULATE_OUTPUT = "CALCULATE_OUTPUT", "Calculate output"

    worker = models.ForeignKey(Machine, on_delete=models.PROTECT)
    action_type = models.CharField(max_length=100, choices=ActionType.choices)
    endpoint = models.CharField(max_length=100)
