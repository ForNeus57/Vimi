from dataclasses import dataclass, field, InitVar


class Token:
    raw_token: InitVar[str]

    token: str = field(init=False, default='')

    def __post_init__(self, raw_token: str) -> None:
        pass

