from uuid import uuid4

from django.db.backends.base.operations import BaseDatabaseOperations
from django.db import models

BaseDatabaseOperations.integer_field_ranges['UUIDField'] = (0, 0)


class UUIDAutoField(models.UUIDField, models.AutoField):
    def __init__(self, *args, **kwargs) -> None:
        kwargs.setdefault('default', uuid4)
        kwargs.setdefault('editable', False)
        super().__init__(*args, **kwargs)
