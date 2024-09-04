import asyncio
from argparse import ArgumentParser
from dataclasses import dataclass, field
from typing import List, Type, ClassVar

from vimi_worker.commands.command import Command
from vimi_worker.commands.register import Register
from vimi_worker.commands.run import Run


@dataclass(slots=True)
class App:
    registered_commands: ClassVar[List[Type[Command]]] = [Register, Run]

    command: Command = field(init=False)

    @classmethod
    def run_from_cmd(cls) -> None:
        cls().run()

    def __post_init__(self) -> None:
        parser = ArgumentParser(prog='vimi_worker')

        sub_parsers = parser.add_subparsers(dest='sub_command')

        for command_iter in App.registered_commands:
            sub_parser = sub_parsers.add_parser(command_iter.__name__.lower())
            command_iter.config_sub_parser(sub_parser)

        args = parser.parse_args()
        self.command = next(command_iter(args)
                            for command_iter in App.registered_commands
                            if command_iter.__name__.lower() == args.sub_command)

    def run(self) -> None:
        asyncio.run(self.command.run())


def main() -> None:
    App.run_from_cmd()

if __name__ == '__main__':
    main()
