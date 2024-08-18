"""Module containing all possible exceptions related to models' processing."""


class ModelNotLoaded(Exception):
    """The Model cannot be loaded."""

    def __init__(self, path: str) -> None:
        super().__init__('The model cannot be loaded, because file binary is not the correct format')

        self.path = path
