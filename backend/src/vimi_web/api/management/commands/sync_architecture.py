from argparse import ArgumentParser

from django.core.management.base import BaseCommand
from keras import backend as k

from vimi_web.api.models import Architecture


class Command(BaseCommand):
    help = "Synchronise the model architecture with the database"

    def add_arguments(self, parser: ArgumentParser) -> None:
        pass

    def handle(self, *args, **kwargs) -> None:
        queryset = Architecture.objects.all()

        for architecture in queryset:
            model = architecture.get_model()

            architecture.layers = Architecture.get_computed_layers(model)
            architecture.dimensions = Architecture.get_computed_dimensions(model)
            architecture.save()

            k.clear_session()
            self.stdout.write(self.style.SUCCESS(f'Successfully synchronised "{architecture}"'))
