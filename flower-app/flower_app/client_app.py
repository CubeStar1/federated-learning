"""flower-app: A Flower / sklearn app."""

import warnings

import numpy as np

import flwr as fl
from flwr.app import ArrayRecord, Context, Message, MetricRecord, RecordDict
from flwr.clientapp import ClientApp
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    log_loss,
    precision_score,
    recall_score,
)

from flower_app.task import get_model, get_model_params, load_data, set_initial_params, set_model_params

# Flower ClientApp
app = ClientApp()


@app.train()
def train(msg: Message, context: Context):
    """Train the model on local data."""

    run_cfg = context.run_config
    task_name = run_cfg.get("task-name", "mnist-classification")
    model_name = run_cfg.get("model-name", "logistic-regression")
    dataset_path = run_cfg.get("dataset-path")
    local_epochs = run_cfg.get("local-epochs", 1)
    penalty = run_cfg.get("penalty", "l2")
    image_height = run_cfg.get("input-height", 28)
    image_width = run_cfg.get("input-width", 28)
    channels = run_cfg.get("input-channels", 1)

    # Create model based on registry
    model = get_model(
        task_name,
        model_name,
        {"penalty": penalty, "max_iter": local_epochs},
    )

    # Load the data
    partition_id = context.node_config["partition-id"]
    num_partitions = context.node_config["num-partitions"]
    X_train, _, y_train, _ = load_data(
        partition_id,
        num_partitions,
        task_name=task_name,
        dataset_path=dataset_path,
        image_size=(image_height, image_width),
        channels=channels,
    )
    num_classes = len(np.unique(y_train))
    num_features = X_train.shape[1]

    # Initialize local model params
    set_initial_params(model, num_classes, num_features)

    # Apply received parameters
    ndarrays = msg.content["arrays"].to_numpy_ndarrays()
    set_model_params(model, ndarrays)

    # Ignore convergence failure due to low local epochs
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        # Train the model on local data
        model.fit(X_train, y_train)

    # Let's compute train loss
    y_train_pred_proba = model.predict_proba(X_train)
    train_logloss = log_loss(y_train, y_train_pred_proba)

    # Construct and return reply Message
    ndarrays = get_model_params(model)
    model_record = ArrayRecord(ndarrays)
    metrics = {"num-examples": len(X_train), "train_logloss": train_logloss}
    metric_record = MetricRecord(metrics)
    content = RecordDict({"arrays": model_record, "metrics": metric_record})
    return Message(content=content, reply_to=msg)


@app.evaluate()
def evaluate(msg: Message, context: Context):
    """Evaluate the model on test data."""

    run_cfg = context.run_config
    task_name = run_cfg.get("task-name", "mnist-classification")
    model_name = run_cfg.get("model-name", "logistic-regression")
    dataset_path = run_cfg.get("dataset-path")
    local_epochs = run_cfg.get("local-epochs", 1)
    penalty = run_cfg.get("penalty", "l2")
    image_height = run_cfg.get("input-height", 28)
    image_width = run_cfg.get("input-width", 28)
    channels = run_cfg.get("input-channels", 1)

    model = get_model(
        task_name,
        model_name,
        {"penalty": penalty, "max_iter": local_epochs},
    )

    # Load the data
    partition_id = context.node_config["partition-id"]
    num_partitions = context.node_config["num-partitions"]
    _, X_test, _, y_test = load_data(
        partition_id,
        num_partitions,
        task_name=task_name,
        dataset_path=dataset_path,
        image_size=(image_height, image_width),
        channels=channels,
    )
    num_classes = len(np.unique(y_test))
    num_features = X_test.shape[1]

    set_initial_params(model, num_classes, num_features)

    # Apply received parameters
    ndarrays = msg.content["arrays"].to_numpy_ndarrays()
    set_model_params(model, ndarrays)

    # Evaluate the model on local data
    y_train_pred = model.predict(X_test)
    y_train_pred_proba = model.predict_proba(X_test)

    accuracy = accuracy_score(y_test, y_train_pred)
    loss = log_loss(y_test, y_train_pred_proba)
    precision = precision_score(y_test, y_train_pred, average="macro", zero_division=0)
    recall = recall_score(y_test, y_train_pred, average="macro", zero_division=0)
    f1 = f1_score(y_test, y_train_pred, average="macro", zero_division=0)

    # Construct and return reply Message
    metrics = {
        "num-examples": len(X_test),
        "test_logloss": loss,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }
    metric_record = MetricRecord(metrics)
    content = RecordDict({"metrics": metric_record})
    return Message(content=content, reply_to=msg)

