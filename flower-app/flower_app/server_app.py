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

    # Create LogisticRegression Model
    penalty = context.run_config["penalty"]
    local_epochs = context.run_config["local-epochs"]
    model = get_model(penalty, local_epochs)
    # Setting initial parameters, akin to model.compile for keras models
    set_initial_params(model)
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
