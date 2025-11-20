"""flower-app: A Flower / sklearn app."""

import joblib
from flwr.app import ArrayRecord, Context
from flwr.serverapp import Grid, ServerApp
from flwr.serverapp.strategy import FedAvg

from flower_app.task import get_model, get_model_params, set_initial_params, set_model_params
from flower_app.telemetry import update_run_metrics

# Create ServerApp
app = ServerApp()


@app.main()
def main(grid: Grid, context: Context) -> None:
    """Main entry point for the ServerApp."""

    # Read run config
    num_rounds: int = context.run_config["num-server-rounds"]
    run_cfg = context.run_config
    penalty = run_cfg.get("penalty", "l2")
    local_epochs = run_cfg.get("local-epochs", 1)
    task_name = run_cfg.get("task-name", "mnist-classification")
    model_name = run_cfg.get("model-name", "logistic-regression")
    num_classes = run_cfg.get("num-classes", 10)
    height = run_cfg.get("input-height", 28)
    width = run_cfg.get("input-width", 28)
    channels = run_cfg.get("input-channels", 1)
    num_features = run_cfg.get("num-features", height * width * channels)

    model = get_model(
        task_name,
        model_name,
        {"penalty": penalty, "max_iter": local_epochs},
    )
    # Setting initial parameters, akin to model.compile for keras models
    set_initial_params(model, num_classes, num_features)
    # Construct ArrayRecord representation
    arrays = ArrayRecord(get_model_params(model))

    # Initialize FedAvg strategy
    strategy = FedAvg(fraction_train=1.0, fraction_evaluate=1.0, min_train_nodes=1, min_evaluate_nodes=1, min_available_nodes=1)

    # Start strategy, run FedAvg for `num_rounds`
    result = strategy.start(
        grid=grid,
        initial_arrays=arrays,
        num_rounds=num_rounds,
    )

    print(result.evaluate_metrics_clientapp)
    print(result.train_metrics_clientapp)

    run_id = context.run_config.get("current-run-id")

    update_run_metrics(run_id, result.evaluate_metrics_clientapp, result.train_metrics_clientapp)

    # Save final model parameters
    print("\nSaving final model to disk...")
    ndarrays = result.arrays.to_numpy_ndarrays()
    set_model_params(model, ndarrays)
    joblib.dump(model, "logreg_model.pkl")
