import uuid
from importlib import import_module
from typing import List, Optional, Never

import keras
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db.models import (
    Model,
    OneToOneField,
    UUIDField,
    CharField,
    PositiveIntegerField,
    CASCADE,
    PROTECT,
    FileField,
    ForeignKey,
)

User = get_user_model()

class UserDetail(Model):
    user = OneToOneField(User, on_delete=CASCADE)
    uuid = UUIDField(default=uuid.uuid4, editable=False, unique=True)


class Architecture(Model):
    # TODO: Join layers and dimensions into a single field and create a custom postgresql field for it!
    name = CharField(max_length=64, unique=True, editable=False)
    module = CharField(max_length=256, editable=False)
    layers = ArrayField(base_field=CharField(max_length=64))
    dimensions = ArrayField(base_field=ArrayField(base_field=PositiveIntegerField(default=1), size=3))

    def __str__(self) -> str:
        return self.name

    def clean(self) -> None:
        if len(self.layers) != len(self.dimensions):
            raise ValueError("The number of layers and dimensions should be equal!")

        model = self.get_model()
        computed_layers = self.get_computed_layers(model)
        computed_dimensions = self.get_computed_dimensions(model)

        if self.layers != computed_layers:
            raise ValueError("The layers are not the same as the computed layers!")

        if self.dimensions != computed_dimensions:
            raise ValueError("The dimensions are not the same as the computed dimensions!")

    def get_model(self) -> keras.Model:
        module = import_module(self.module)
        model_caller = getattr(module, self.name)
        return model_caller()

    def get_computed_layers(self, model: Optional[keras.Model] = None) -> List[str]:
        # TODO: validate that the model is our model!
        if model is None:
            model = self.get_model()

        return [f'{layer.name} ({layer.__class__.__name__})' for layer in model.layers]

    def get_computed_dimensions(self, model: Optional[keras.Model] = None) -> List[List[int]]:
        # TODO: validate that the model is our model!
        # TODO: Set reasonable defaults for the dimensions. Aka defaults from dimensions model class field!
        if model is None:
            model = self.get_model()

        dimensions = [list(model.input_shape[1:])] + [list(layer.output.shape[1:]) for layer in model.layers[1:]]
        return [dimension + [1] * (3 - len(dimension)) for dimension in dimensions]


class NetworkInput(Model):
    uuid = UUIDField(default=uuid.uuid4, editable=False, unique=True)
    # TODO: Make use of MEDIA_ROOT and change this to ftp-server
    file = FileField(upload_to='fixtures/upload/', max_length=128, editable=False)

    class Meta:
        # TODO: Automatically determine 'api' prefix
        db_table = 'api_network_input'

    def __str__(self) -> str:
        return str(self.uuid)
