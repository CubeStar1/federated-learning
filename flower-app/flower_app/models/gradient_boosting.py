"""Gradient Boosting factory."""

from __future__ import annotations

from sklearn.ensemble import GradientBoostingClassifier

from .base import ModelFactory


def _build(params):
    return GradientBoostingClassifier(
        learning_rate=params.get("learning_rate", 0.05),
        n_estimators=params.get("n_estimators", 200),
        max_depth=params.get("max_depth", 3),
        subsample=params.get("subsample", 0.9),
        validation_fraction=params.get("validation_fraction", 0.1),
        n_iter_no_change=params.get("n_iter_no_change", 5),
    )


FACTORY = ModelFactory(
    name="gradient-boosting",
    label="Gradient Boosting",
    description="Tree-based boosting ensemble suited for tabular embeddings of medical scans.",
    defaults={
        "learning_rate": 0.05,
        "n_estimators": 200,
        "max_depth": 3,
        "subsample": 0.9,
    },
    builder=_build,
)

