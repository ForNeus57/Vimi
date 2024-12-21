from typing import Tuple

import pytest
import numpy as np
from vimi_lib.data.arr import ensure_3d

@pytest.mark.parametrize(
    "input_array, expected_shape",
    [
        (np.array(5), (1, 1, 1)),
        (np.array([1, 2, 3]), (1, 1, 3)),
        (np.array([[1, 2, 3], [4, 5, 6]]), (1, 2, 3)),
        (np.array([[[1, 2, 3], [4, 5, 6]]]), (1, 2, 3)),
    ],
)
def test_ensure_3d(input_array: np.ndarray, expected_shape: Tuple[int, ...]) -> None:

    result = ensure_3d(input_array)
    assert result.shape == expected_shape, f"Expected shape {expected_shape}, got {result.shape}"
    assert result.ndim == 3, "Resulting array should have 3 dimensions"
