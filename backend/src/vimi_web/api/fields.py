import uuid
from typing import Tuple, Optional, List

from django.db import connection
from django.db.backends.base.operations import BaseDatabaseOperations
from django.db.models import AutoField, UUIDField

from psycopg2.extras import register_composite
from psycopg2.extensions import adapt, AsIs
from typing_extensions import NamedTuple

from vimi_lib import models

ModelLayer = register_composite(
    'model_layer',
    connection.cusror().cursor,
    globally=True,
).type

def model_layer_adapter(value):
    return AsIs('(%s, %s)::model_layer' % (
        adapt(value.name),
        adapt(value.dimensions),
    ))

register_composite(ModelLayer, model_layer_adapter)

class ModelLayer:
    def __init__(self, name: str, dimensions: List[int]) -> None:
        self.name = name
        self.dimensions = dimensions


class ModelLayerField(models.Field):
    def from_db_value(self, value: Optional[NamedTuple]) -> Optional[ModelLayer]:
        if value is None:
            return value

        return ModelLayer(value.name, value.dimensions)

    def to_python(self, value: Optional[NamedTuple]) -> Optional[ModelLayer]:
        if isinstance(value, ModelLayer):
            return value

        if value is None:
            return value

        return ModelLayer(value.name, value.dimensions)

    def get_prep_value(self, value: NamedTuple) -> Tuple:
        return value.name, value.dimensions

    def db_type(self) -> str:
        return 'model_layer'


BaseDatabaseOperations.integer_field_ranges['UUIDField'] = (0, 0)


class UUIDAutoField(UUIDField, AutoField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('default', uuid.uuid4)
        kwargs.setdefault('editable', False)
        super().__init__(*args, **kwargs)
