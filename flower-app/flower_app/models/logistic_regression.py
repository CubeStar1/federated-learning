"""Logistic Regression factory."""

from __future__ import annotations

from sklearn.linear_model import LogisticRegression

from .base import ModelFactory


def _build(params):
    return LogisticRegression(
        penalty=params.get("penalty", "l2"),
        solver=params.get("solver", "lbfgs"),
        max_iter=params.get("max_iter", 100),
        warm_start=True,
        n_jobs=params.get("n_jobs"),
        multi_class=params.get("multi_class", "auto"),
    )


FACTORY = ModelFactory(
    name="logistic-regression",
    label="Logistic Regression (Baseline)",
    description="Multinomial logistic regression over flattened pixels or embeddings.",
    defaults={
        "penalty": "l2",
        "solver": "lbfgs",
        "max_iter": 50,
    },
    builder=_build,
)

