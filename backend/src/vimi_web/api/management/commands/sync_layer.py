from argparse import ArgumentParser

from django.core.management.base import BaseCommand

from vimi_web.api.models import Architecture, Layer


class Command(BaseCommand):
    help = "Synchronise the models: architecture and layer with the database"

    def add_arguments(self, parser: ArgumentParser) -> None:
        pass

    def handle(self, *args, **kwargs) -> None:
        queryset = Architecture.objects.all()

        for architecture in queryset:
            Layer.objects.bulk_create(architecture.get_layers())

            self.stdout.write(
                self.style.SUCCESS(f'Successfully synchronised "{architecture}"')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Layer Synchronization finished')
        )
