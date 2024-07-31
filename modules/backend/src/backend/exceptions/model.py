"""Module containing all possible exceptions related to models processing."""

class ModelNotLoaded(Exception):
    """Model cannot be loaded."""

    def __init__(self, path: str) -> None:
        super().__init__('File binary is not the correct format')

        self.path = path
