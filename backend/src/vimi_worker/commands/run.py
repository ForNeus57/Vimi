from argparse import ArgumentParser, Namespace
from dataclasses import dataclass, field
from ftplib import FTP
from typing import final

from vimi_worker.commands.command import Command


@final
@dataclass(slots=True)
class Run(Command):
    url: str = field(init=False)

    @classmethod
    def config_sub_parser(cls, sub_parser: ArgumentParser) -> None:
        sub_parser.add_argument(
            "--url",
            type=str,
            help="URL of the worker",
            default='http://localhost:8000/worker/register/',
            required=False,
            dest="url"
        )

    def __post_init__(self, cmd_arguments: Namespace) -> None:
        self.url = cmd_arguments.url

    async def run(self) -> None:
        pass
