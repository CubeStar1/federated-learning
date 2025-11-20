"""Shallow MLP factory."""

from __future__ import annotations

from sklearn.neural_network import MLPClassifier

from .base import ModelFactory


def _build(params):
    return MLPClassifier(
        hidden_layer_sizes=params.get("hidden_layer_sizes", (512, 256)),
        activation=params.get("activation", "relu"),
        solver=params.get("solver", "adam"),
        batch_size=params.get("batch_size", 64),
        learning_rate_init=params.get("learning_rate_init", 1e-3),
        max_iter=params.get("max_iter", 20),
        shuffle=params.get("shuffle", True),
        warm_start=True,
    )


FACTORY = ModelFactory(
    name="mlp-classifier",
    label="Two-layer MLP",
    description="Dense neural network for medium-sized medical image patches.",
    defaults={
        "hidden_layer_sizes": (512, 256),
        "activation": "relu",
        "solver": "adam",
        "batch_size": 64,
        "learning_rate_init": 1e-3,
        "max_iter": 20,
    },
    builder=_build,
)

