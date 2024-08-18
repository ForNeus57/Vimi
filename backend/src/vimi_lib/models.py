"""Helper functions for model analysis"""

from typing import Tuple, List
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# import tensorflow as tf
import keras

from vimi_lib.exceptions.model_not_loaded import ModelNotLoaded


def get_model_size(model_path: str) -> List[Tuple]:
    """Function to get the size of the model"""
    model = keras.saving.load_model(model_path)

    if model is None:
        raise ModelNotLoaded(model_path)

    model_size = []
    for layer in model.layers:
        model_size.append(layer.output.shape[1:])

    return model_size
