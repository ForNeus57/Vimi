from argparse import ArgumentParser, Namespace
from dataclasses import dataclass, field
from typing import final

from vimi_worker.commands.command import Command

import requests


@final
@dataclass(slots=True)
class Register(Command):
    url: str = field(init=False)
    base_url: str = field(init=False)
    # description: str

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
        # sub_parser.add_argument("description", type=str, help="Description of the worker")
        # sub_parser.add_argument("base_url", type=str, help="Base URL of the worker")

    def __post_init__(self, cmd_arguments: Namespace) -> None:
        self.url = cmd_arguments.url
        self.base_url = "http://localhost:5000"
        # self.description = self.cmd_arguments.description

    async def run(self) -> None:
        print(
            requests.post(self.url, json={"base_url": self.base_url}).content.decode('utf-8')
        )
