from argparse import ArgumentParser

from django.core.management.base import BaseCommand
from keras import backend as k

from vimi_web.api.models import Architecture, Layer


class Command(BaseCommand):
    help = "Synchronise the models: architecture and layer with the database"

    def add_arguments(self, parser: ArgumentParser) -> None:
        pass

    def handle(self, *args, **kwargs) -> None:
        queryset = Architecture.objects.all()

        for architecture in queryset:
            model = architecture.get_model()

            layer_names = Architecture.get_computed_layers(model)
            dimensions = Architecture.get_computed_dimensions(model)
            # TODO: Assert Order
            assert len(layer_names) == len(dimensions), 'dimensions and layer names must have the same count'

            Layer.objects.bulk_create([
                Layer(architecture=architecture,
                      layer_number=index,
                      name=name,
                      dimensions=dimension) for index, (name, dimension) in enumerate(zip(layer_names, dimensions))
            ])

            k.clear_session()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully synchronised "{architecture}"')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Layer Synchronization finished')
        )
