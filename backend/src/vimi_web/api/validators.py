from typing import Dict, Optional
import string

from django.contrib.auth.models import User
from django.utils.translation import gettext
from rest_framework.exceptions import ValidationError


class SymbolsPresentsValidator:
    def __init__(self, symbols: Optional[Dict[str, frozenset[str]]] = None) -> None:
        if symbols is None:
            symbols = {
                "uppercase": frozenset(string.ascii_uppercase),
                "lowercase": frozenset(string.ascii_lowercase),
                "digit": frozenset(string.digits),
                "punctuation": frozenset(string.punctuation),
            }

        self.symbols = symbols

    def validate(self, password: str, user: Optional[User] = None) -> None:
        for symbol_name, symbol_set in self.symbols.items():
            if not any(char in symbol_set for char in password):
                raise ValidationError(
                    gettext(f"Password must contain at least one {symbol_name.title()}."),
                    code="password_bad_content",
                )

        for character in password:
            if character not in string.printable:
                raise ValidationError(
                    gettext("Password must contain only printable characters."),
                    code="password_bad_content",
                )

    def get_help_text(self) -> str:
        return gettext(
            f"Your password must contain at least one of the following: {', '.join(self.symbols.keys()).title()} and be printable."
        )


class MaximumLengthValidator:
    def __init__(self, max_length: int) -> None:
        self.max_length = max_length

    def validate(self, password: str, user: Optional[User] = None) -> None:
        if len(password) > self.max_length:
            raise ValidationError(
                gettext(f"Password must not exceed {self.max_length} characters."),
                code="password_too_long",
            )

    def get_help_text(self) -> str:
        return gettext(f"Your password must not exceed {self.max_length} characters.")
