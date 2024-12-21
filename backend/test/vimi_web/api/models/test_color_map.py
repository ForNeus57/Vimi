import cv2
import pytest
import numpy as np
from django.core.management import call_command

from vimi_web.api.models import ColorMap


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup, django_db_blocker) -> None:
    with django_db_blocker.unblock():
        call_command('loaddata', 'initial_data')


@pytest.mark.django_db
@pytest.mark.parametrize(
    'tested_image',
    [
        'test/resources/images/dom.png',
        'test/resources/images/ferrari.bmp',
        'test/resources/images/figura4.png',
        'test/resources/images/firetruck.jpg',
        'test/resources/images/jet.bmp',
        'test/resources/images/jezioro.jpg',
        'test/resources/images/mandrill.png',
        'test/resources/images/moon.png',
        'test/resources/images/perfect_gray.bmp',
        'test/resources/images/rice.png',
    ],
)
def test_attribute_to_user_map_binary_mapping(tested_image: str) -> None:
    tested_image: np.ndarray = cv2.imread(tested_image, cv2.IMREAD_GRAYSCALE)
    assert tested_image is not None, 'tested_image should be loaded'
    assert len(tested_image.shape) == 2, 'tested_image should be grayscale'

    queryset = ColorMap.objects.exclude(attribute__isnull=True)
    assert len(queryset) != 0, 'queryset cannot be empty'

    for color_map in queryset:
        cv2_color_map_attribute = color_map.get_color_map()
        assert cv2_color_map_attribute is not None, 'queryset cannot contain records with no cv2 attribute'

        image_by_attribute = cv2.applyColorMap(tested_image, colormap=cv2_color_map_attribute)
        image_by_user_map_binary = np.squeeze(color_map.apply_color_map(np.expand_dims(tested_image, axis=-1)), axis=-1)

        assert np.all(image_by_attribute == image_by_user_map_binary), 'Methods should be equivalent'
