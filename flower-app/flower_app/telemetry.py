from __future__ import annotations

import os
import threading
from collections.abc import Iterable
from typing import Any, Dict, Optional
from dotenv import load_dotenv

from supabase import Client, create_client

load_dotenv()

_CLIENT_LOCK = threading.Lock()
_CLIENT: Optional[Client] = None


def _get_client() -> Optional[Client]:
	global _CLIENT
	if _CLIENT is not None:
		return _CLIENT

	url = os.getenv("SUPABASE_URL")
	key = os.getenv("SUPABASE_KEY")
	if not url or not key:
		return None

	with _CLIENT_LOCK:
		if _CLIENT is None:
			try:
				_CLIENT = create_client(url, key)
			except Exception:
				return None
	return _CLIENT


def _to_jsonable(value: Any) -> Any:
	if value is None or isinstance(value, (bool, int, float, str)):
		return value
	if hasattr(value, "item"):
		try:
			return value.item()
		except Exception:
			pass
	if isinstance(value, dict):
		return {str(k): _to_jsonable(v) for k, v in value.items()}
	if isinstance(value, (list, tuple, set, frozenset, Iterable)):
		try:
			return [_to_jsonable(v) for v in value]
		except TypeError:
			pass
	return str(value)


def _sanitize_metrics(metrics: Optional[Dict[Any, Dict[str, Any]]]) -> Dict[str, Dict[str, Any]]:
	clean: Dict[str, Dict[str, Any]] = {}
	if not metrics:
		return clean
	for key, value in metrics.items():
		clean[str(key)] = {str(metric): _to_jsonable(result) for metric, result in value.items()}
	return clean


def update_run_metrics(
	run_id: Optional[str],
	evaluate_metrics: Optional[Dict[Any, Dict[str, Any]]],
	train_metrics: Optional[Dict[Any, Dict[str, Any]]],
) -> None:
	client = _get_client()
	if not client:
		print("Telemetry: Supabase client unavailable; skipping metrics upload")
		return
	if not run_id:
		print("Telemetry: FLWR_RUN_ID missing; skipping metrics upload")
		return

	payload = {
		"metrics": {
			"evaluate": _sanitize_metrics(evaluate_metrics),
			"train": _sanitize_metrics(train_metrics),
		}
	}

	try:
		print(f"Telemetry: updating metrics for run {run_id}: {payload}")
		client.table("federated_runs").update(payload).eq("id", run_id).execute()
	except Exception as exc:
		print(f"Telemetry: failed to update metrics for run {run_id}: {exc}")

