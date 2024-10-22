from typing import Optional

from django.core.files import File
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class FTPStorage(Storage):
    def __init__(self,
                 host: Optional[str] = None,
                 port: Optional[str] = None,
                 login: Optional[str] = None,
                 password: Optional[str] = None,
                 path: Optional[str] = None) -> None:
        if host is None:
            host = 'localhost'
        if port is None:
            port = '21'
        if path is None:
            path = '/upload'


    def _open(self, name: str, mode: str = 'rb') -> File:
        raise FileNotFoundError(name)

    def _save(self):
        pass

    def delete(self, name: str):
        pass

    def exists(self, name):
        pass

    def listdir(self, path):
        pass

    def size(self, name):
        pass

    def url(self, name: str) -> str:
        raise NotImplementedError