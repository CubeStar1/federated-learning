"""Model registry for the Flower app."""

from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Tuple

from .base import ModelFactory
from . import gradient_boosting, logistic_regression, mlp, random_forest


def _collect_factories() -> Dict[str, ModelFactory]:
    factories: Dict[str, ModelFactory] = {}
    for module in (logistic_regression, mlp, gradient_boosting, random_forest):
        factory = module.FACTORY
        factories[factory.name] = factory
    return factories


MODEL_FACTORIES: Dict[str, ModelFactory] = _collect_factories()


TASK_MODEL_MATRIX: Dict[str, Tuple[str, ...]] = {
    "tb-prediction": ("logistic-regression", "mlp-classifier", "gradient-boosting", "random-forest"),
    "diabetic-retinopathy": ("logistic-regression", "mlp-classifier", "gradient-boosting", "random-forest"),
    "brain-tumor": ("logistic-regression", "mlp-classifier", "gradient-boosting", "random-forest"),
    "mnist-classification": ("logistic-regression", "mlp-classifier"),
}


def get_available_models(task_name: Optional[str] = None) -> Tuple[str, ...]:
    if task_name:
        if task_name in TASK_MODEL_MATRIX:
            return TASK_MODEL_MATRIX[task_name]
    return tuple(MODEL_FACTORIES.keys())


def describe_models(task_name: Optional[str] = None) -> List[Dict[str, str]]:
    names = get_available_models(task_name)
    return [
        {
            "value": MODEL_FACTORIES[name].name,
            "label": MODEL_FACTORIES[name].label,
            "description": MODEL_FACTORIES[name].description,
        }
        for name in names
    ]


def build_model(task_name: str, model_name: str, overrides: Optional[Dict[str, object]] = None):
    allowed = get_available_models(task_name)
    if allowed and model_name not in allowed:
        raise ValueError(f"Model '{model_name}' is not registered for task '{task_name}'. Allowed: {allowed}")
    factory = MODEL_FACTORIES.get(model_name)
    if not factory:
        raise ValueError(f"Unknown model '{model_name}'. Available models: {tuple(MODEL_FACTORIES.keys())}")
    return factory.build(overrides)

