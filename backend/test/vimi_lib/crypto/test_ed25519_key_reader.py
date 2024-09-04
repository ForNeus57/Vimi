from pathlib import Path
from typing import List, Tuple
from unittest.mock import patch, mock_open

from pytest import mark

from vimi_lib.crypto.rsa_key_reader import get_rsa_private_from_file

test_case_data_raw = [
    ("./test/vimi_lib/crypto/in_1.pem", "F3f5bKt-trJpRukbsDX9", "./test/vimi_lib/crypto/out_1.pem"),
    # ("in_1.pem", "password1", "out_1.pem"),
    # ("in_1.pem", "password1", "out_1.pem"),
    # ("in_1.pem", "password1", "out_1.pem"),
]

test_case_data: List[Tuple[bytes, str, str]] = []

for raw in test_case_data_raw:
    input_file_path, password_data, output_file_path = raw
    with open(input_file_path, "rb") as input_file, open(output_file_path, "r") as output_file:
        content = input_file.read()
        expected_content = output_file.read()

        test_case_data.append(
            (content, password_data, expected_content)
        )

@mark.parametrize(
    "file_content, password, expected",
    test_case_data
)
def test_get_rsa_private_from_file(file_content: bytes, password: str, expected: str) -> None:
    with patch("builtins.open", mock_open(read_data=file_content)):
        result = get_rsa_private_from_file(Path("dummy_path.pem"), password)
        assert result == expected
