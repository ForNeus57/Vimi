from argparse import ArgumentParser

from django.core.management.base import BaseCommand

from vimi_web.api.models import Architecture


class Command(BaseCommand):
    help = "Synchronise the model architecture with the database"

    def add_arguments(self, parser: ArgumentParser) -> None:
        pass

    def handle(self, *args, **options) -> None:
        architectures = Architecture.objects.all()

        for architecture in architectures:
            model = architecture.get_model()

            architecture.layers = architecture.get_computed_layers(model)
            architecture.dimensions = architecture.get_computed_dimensions(model)
            architecture.save()

            self.stdout.write(self.style.SUCCESS(f"Successfully synchronised {architecture}"))