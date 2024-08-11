"""Exceptions related to file operations."""


class NoFileUploaded(Exception):
    """The File is not uploaded."""

    def __init__(self) -> None:
        super().__init__('File is not attached to the request')


class TooManyFilesUploaded(Exception):
    """Too many files are uploaded."""

    def __init__(self) -> None:
        super().__init__('Too many files are uploaded')


class WrongFieldNameProvided(Exception):
    """The Wrong Field Name is provided in http Form Data."""

    def __init__(self, available_field_name: str) -> None:
        super().__init__(
            f'File has wrong field name provided, should be: \'{available_field_name}\''
        )

        self.available_field_name = available_field_name


class WrongExtensionProvided(Exception):
    """Uploaded File has a wrong extension."""

    def __init__(self, provided_extension: str) -> None:
        super().__init__(
            f'File has wrong extension: \'{provided_extension}\''
        )

        self.provided_extension = provided_extension
