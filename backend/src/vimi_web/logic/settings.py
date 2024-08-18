from dataclasses import dataclass
from typing import Final, Dict, Optional, List

from vimi_lib.utils.singleton import SingletonMeta


@dataclass(slots=True)
class Settings(metaclass=SingletonMeta):

    minimum_password_length: Final[int] = 8
    maximum_password_length: Final[int] = 32

    max_model_size: Final[int] = 16 * 1024 * 1024  # 16MB
    model_allowed_extensions: Final[frozenset[str]] = frozenset({".h5"})

    # max_image_size: Final[int] = 2 * 1024 * 1024  # 2MB

    def get_config_frontend(self) -> Dict[str, Optional[str | int | float| List]]:
        return {
            "maxModelSize": self.max_model_size,
            "modelAllowedExtensions": list(self.model_allowed_extensions),
        }
