from abc import ABC, abstractmethod
from argparse import Namespace, ArgumentParser
from dataclasses import InitVar, dataclass


@dataclass(slots=True)
class Command(ABC):
    cmd_arguments: InitVar[Namespace]

    @classmethod
    @abstractmethod
    def config_sub_parser(cls, sub_parser: ArgumentParser) -> None:
        pass

    @abstractmethod
    def __post_init__(self, cmd_arguments: Namespace) -> None:
        pass

    @abstractmethod
    async def run(self) -> None:
        pass
