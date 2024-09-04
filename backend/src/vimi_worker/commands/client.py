from argparse import ArgumentParser, Namespace
from dataclasses import dataclass, field
from typing import final

from vimi_worker.commands.command import Command


@final
@dataclass(slots=True)
class Client(Command):

    @classmethod
    def config_sub_parser(cls, sub_parser: ArgumentParser) -> None:
        pass

    def __post_init__(self, cmd_arguments: Namespace) -> None:
        pass

    async def run(self) -> None:
        pass
