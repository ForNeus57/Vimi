import numpy as np

def ensure_3d(arr: np.ndarray) -> np.ndarray:
    """Expands the array dimensions to a 3"""

    while arr.ndim < 3:
        arr = np.expand_dims(arr, axis=0)

    return arr
