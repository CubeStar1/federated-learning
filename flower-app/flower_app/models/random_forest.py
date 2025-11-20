"""Random Forest factory."""

from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier

from .base import ModelFactory


def _build(params):
    return RandomForestClassifier(
        n_estimators=params.get("n_estimators", 300),
        max_depth=params.get("max_depth"),
        min_samples_split=params.get("min_samples_split", 2),
        min_samples_leaf=params.get("min_samples_leaf", 1),
        max_features=params.get("max_features", "sqrt"),
        bootstrap=params.get("bootstrap", True),
        n_jobs=params.get("n_jobs"),
    )


FACTORY = ModelFactory(
    name="random-forest",
    label="Random Forest",
    description="Bagged decision trees for robust baseline performance on noisy medical features.",
    defaults={
        "n_estimators": 300,
        "max_features": "sqrt",
        "bootstrap": True,
    },
    builder=_build,
)

