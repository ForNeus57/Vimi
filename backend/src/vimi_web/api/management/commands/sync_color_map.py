from argparse import ArgumentParser

import numpy as np
import cv2
from django.core.management.base import BaseCommand

from vimi_web.api.models import ColorMap


class Command(BaseCommand):
    help = "Synchronise the model color maps with the database"

    def add_arguments(self, parser: ArgumentParser) -> None:
        pass

    def handle(self, *args, **kwargs) -> None:
        queryset = ColorMap.objects.filter(attribute__isnull=False)

        for color_map in queryset:
            cv2_color_map_attribute = color_map.get_color_map()
            assert cv2_color_map_attribute is not None, 'Cannot compute synchronize for non-cv2 color maps'

            continues_gray_values = np.arange(256, dtype=np.uint8)
            color_function_values = cv2.applyColorMap(continues_gray_values, colormap=cv2_color_map_attribute)

            color_map.user_map_binary = color_function_values.tobytes()
            color_map.save()

            self.stdout.write(
                self.style.SUCCESS(f'Successfully synchronised "{color_map}"')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Color Map Synchronization finished')
        )
