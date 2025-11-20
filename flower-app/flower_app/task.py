"""Task helpers for loading data and managing model parameters."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np
from PIL import Image
from flwr_datasets import FederatedDataset
from flwr_datasets.partitioner import IidPartitioner
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier

from flower_app.models import build_model

_MNIST_CACHE = None  # Cache FederatedDataset

SUPPORTED_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".bmp"}


@dataclass(frozen=True)
class TaskMetadata:
    key: str
    label: str
    description: str
    default_image_size: Tuple[int, int]
    default_channels: int
    default_num_classes: int


TASK_METADATA: Dict[str, TaskMetadata] = {
    "tb-prediction": TaskMetadata(
        key="tb-prediction",
        label="Tuberculosis screening",
        description="Classify chest X-rays for tuberculosis screening.",
        default_image_size=(224, 224),
        default_channels=1,
        default_num_classes=2,
    ),
    "diabetic-retinopathy": TaskMetadata(
        key="diabetic-retinopathy",
        label="Diabetic retinopathy",
        description="Detect diabetic retinopathy severity from fundus images.",
        default_image_size=(256, 256),
        default_channels=3,
        default_num_classes=5,
    ),
    "brain-tumor": TaskMetadata(
        key="brain-tumor",
        label="Brain tumour MRI",
        description="MRI-based brain tumour classification.",
        default_image_size=(224, 224),
        default_channels=1,
        default_num_classes=3,
    ),
    "mnist-classification": TaskMetadata(
        key="mnist-classification",
        label="MNIST baseline",
        description="Baseline MNIST digit classification.",
        default_image_size=(28, 28),
        default_channels=1,
        default_num_classes=10,
    ),
}


def describe_tasks():
    tasks: list[dict[str, object]] = []
    for key, meta in TASK_METADATA.items():
        height, width = meta.default_image_size
        tasks.append(
            {
                "key": key,
                "label": meta.label,
                "description": meta.description,
                "defaults": {
                    "input_height": height,
                    "input_width": width,
                    "input_channels": meta.default_channels,
                    "num_classes": meta.default_num_classes,
                },
            }
        )
    return tasks


def _load_user_dataset(
    dataset_path: str,
    image_size: Tuple[int, int],
    channels: int,
    shuffle_seed: int = 42,
):
    dataset_root = Path(dataset_path)
    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset directory '{dataset_path}' not found")

    class_dirs = sorted([d for d in dataset_root.iterdir() if d.is_dir()])
    if not class_dirs:
        raise ValueError(f"No class sub-directories found in '{dataset_path}'")
    label_map = {cls_dir.name: idx for idx, cls_dir in enumerate(class_dirs)}

    data = []
    labels = []
    mode = "L" if channels == 1 else "RGB"

    for class_dir in class_dirs:
        for image_path in class_dir.rglob("*"):
            if image_path.suffix.lower() not in SUPPORTED_IMAGE_EXTS:
                continue
            with Image.open(image_path) as img:
                arr = (
                    img.convert(mode)
                    .resize(image_size)
                )
                np_img = np.asarray(arr, dtype=np.float32) / 255.0
                data.append(np_img.flatten())
                labels.append(label_map[class_dir.name])

    if not data:
        raise ValueError(f"No images with supported extensions found in '{dataset_path}'")

    X = np.stack(data)
    y = np.array(labels, dtype=np.int32)

    rng = np.random.default_rng(shuffle_seed)
    indices = rng.permutation(len(X))
    return X[indices], y[indices]


def _partition_dataset(X, y, partition_id: int, num_partitions: int):
    splits = np.array_split(np.arange(len(X)), num_partitions)
    selected_idx = splits[partition_id]
    return X[selected_idx], y[selected_idx]


def load_data(
    partition_id: int,
    num_partitions: int,
    *,
    task_name: str,
    dataset_path: Optional[str],
    image_size: Tuple[int, int],
    channels: int,
    test_size: float = 0.2,
    shuffle_seed: int = 42,
):
    if dataset_path:
        X, y = _load_user_dataset(dataset_path, image_size, channels, shuffle_seed)
        X_part, y_part = _partition_dataset(X, y, partition_id, num_partitions)
        return train_test_split(
            X_part,
            y_part,
            test_size=test_size,
            random_state=shuffle_seed,
            stratify=y_part if len(np.unique(y_part)) > 1 else None,
        )

    # Fallback to MNIST for quick experiments
    global _MNIST_CACHE
    if _MNIST_CACHE is None:
        partitioner = IidPartitioner(num_partitions=num_partitions)
        _MNIST_CACHE = FederatedDataset(
            dataset="ylecun/mnist",
            partitioners={"train": partitioner},
        )

    dataset = _MNIST_CACHE.load_partition(partition_id, "train").with_format("numpy")
    X, y = dataset["image"].reshape((len(dataset), -1)), dataset["label"]
    return train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=shuffle_seed,
        stratify=y,
    )


def get_model(task_name: str, model_name: str, hyperparams: Optional[Dict] = None):
    return build_model(task_name, model_name, hyperparams or {})


def get_model_params(model):
    if hasattr(model, "coef_"):
        params = [model.coef_]
        if getattr(model, "fit_intercept", False):
            params.append(model.intercept_)
        return params
    if isinstance(model, MLPClassifier):
        return model.coefs_ + model.intercepts_
    raise ValueError(f"Unsupported model type: {type(model)}")


def set_model_params(model, params):
    if hasattr(model, "coef_"):
        model.coef_ = params[0]
        if getattr(model, "fit_intercept", False):
            model.intercept_ = params[1]
        return model
    if isinstance(model, MLPClassifier):
        num_weight_matrices = len(model.coefs_)
        model.coefs_ = params[:num_weight_matrices]
        model.intercepts_ = params[num_weight_matrices:]
        return model
    raise ValueError(f"Unsupported model type: {type(model)}")


def set_initial_params(model, num_classes: int, num_features: int):
    model.classes_ = np.arange(num_classes)
    if hasattr(model, "coef_"):
        model.coef_ = np.zeros((num_classes, num_features), dtype=np.float32)
        if getattr(model, "fit_intercept", False):
            model.intercept_ = np.zeros((num_classes,), dtype=np.float32)
        return
    if isinstance(model, MLPClassifier):
        layer_sizes = [num_features, *model.hidden_layer_sizes, num_classes]
        coefs = []
        intercepts = []
        for in_dim, out_dim in zip(layer_sizes[:-1], layer_sizes[1:]):
            coefs.append(np.zeros((in_dim, out_dim), dtype=np.float32))
            intercepts.append(np.zeros((out_dim,), dtype=np.float32))
        model.coefs_ = coefs
        model.intercepts_ = intercepts
        return
    raise ValueError(f"Unsupported model type: {type(model)}")
