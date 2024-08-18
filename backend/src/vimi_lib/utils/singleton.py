"""Implementation of Singleton Metaclass for a thread-safe Singleton pattern."""

from threading import Lock
from typing import Dict, Any


class SingletonMeta(type):
    """
    This is a thread-safe implementation of Singleton.
    """

    _instances: Dict[type, Any] = {}
    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs) -> Any:
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance

        return cls._instances[cls]
