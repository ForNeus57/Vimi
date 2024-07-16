"""Helper functions for model analaisis"""

from typing import Tuple, List
import os

import tensorflow as tf
import keras

from backend.exceptions.model import ModelNotLoaded

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def get_model_size(model_path: str) -> List[Tuple]:
    """Function to get the size of the model"""
    model = keras.saving.load_model(model_path)

    if model is None:
        raise ModelNotLoaded(model_path)

    model_size = [model.input.shape]
    for layer in model.layers:
        model_size.append(layer.output.shape)

    return model_size
