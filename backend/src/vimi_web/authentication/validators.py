from typing import Dict, Optional
import string

from django.contrib.auth.models import User
from django.core import exceptions
from django.utils.translation import gettext


class SymbolsPresentsValidator:
    def __init__(self, symbols: Optional[Dict[str, frozenset[str]]] = None) -> None:
        if symbols is None:
            symbols = {
                'uppercase': frozenset(string.ascii_uppercase),
                'lowercase': frozenset(string.ascii_lowercase),
                'digit': frozenset(string.digits),
                'punctuation': frozenset(string.punctuation),
            }

        self.symbols = symbols

    def __call__(self, *args, **kwargs) -> None:
        self.validate(*args, **kwargs)

    def validate(self, password: str, user: Optional[User] = None) -> None:
        for symbol_name, symbol_set in self.symbols.items():
            if not any(char in symbol_set for char in password):
                raise exceptions.ValidationError(
                    gettext(f"Field must contain at least one {symbol_name.title()}."),
                    code="field_bad_content",
                )

        for character in password:
            if character not in string.printable:
                raise exceptions.ValidationError(
                    gettext("Field must contain only printable characters."),
                    code="field_bad_content",
                )

    def get_help_text(self) -> str:
        return gettext(
            f"Your field must contain at least one of the following: {', '.join(self.symbols.keys()).title()} and be printable."
        )


class MaximumLengthValidator:
    def __init__(self, max_length: Optional[int]) -> None:
        if max_length is None:
            max_length = 32
        self.max_length = max_length

    def __call__(self, *args, **kwargs) -> None:
        self.validate(*args, **kwargs)

    def validate(self, password: str, user: Optional[User] = None) -> None:
        if len(password) > self.max_length:
            raise exceptions.ValidationError(
                gettext(f"Field must not exceed {self.max_length} characters."),
                code="field_too_long",
            )

    def get_help_text(self) -> str:
        return gettext(f"Your field must not exceed {self.max_length} characters.")


class UsernameUniquenessValidator:
    def __call__(self, *args, **kwargs) -> None:
        self.validate(*args, **kwargs)

    def validate(self, username: str, user: Optional[User] = None) -> None:
        if User.objects.filter(username=username).exists():
            raise exceptions.ValidationError(
                gettext("Username is already in use."),
                code="username_in_use",
            )

    def get_help_text(self) -> str:
        return gettext("Username must be unique.")


class EmailUniquenessValidator:
    def __call__(self, *args, **kwargs) -> None:
        self.validate(*args, **kwargs)

    def validate(self, email: str, user: Optional[User] = None) -> None:
        if User.objects.filter(email=email).exists():
            raise exceptions.ValidationError(
                gettext("Email is already in use."),
                code="email_in_use",
            )

    def get_help_text(self) -> str:
        return gettext("Email must be unique.")
