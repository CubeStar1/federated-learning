"""Telemetry helpers for sending Flower metrics to Supabase."""

from __future__ import annotations

import json
import os
from datetime import datetime
from typing import Any, Dict, Optional
from dotenv import load_dotenv

from supabase import Client, create_client

_SUPABASE: Optional[Client] = None

load_dotenv()


def _get_client() -> Optional[Client]:
    global _SUPABASE
    if _SUPABASE is not None:
        return _SUPABASE
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        return None
    _SUPABASE = create_client(url, key)
    return _SUPABASE


def _base_payload() -> Dict[str, Any]:
    payload: Dict[str, Any] = {}
    run_id = os.getenv("FLWR_RUN_ID")
    session_id = os.getenv("NODE_SESSION_ID") or os.getenv("FLWR_NODE_SESSION_ID")
    if run_id:
        payload["run_id"] = run_id
    if session_id:
        payload["node_session_id"] = session_id
    return payload


def log_event(event_type: str, extra: Optional[Dict[str, Any]] = None) -> None:
    client = _get_client()
    if client is None:
        return
    payload = _base_payload()
    payload.update({"event_type": event_type, "payload": extra or {}, "created_at": datetime.utcnow().isoformat()})
    try:
        client.table("federated_events").insert(payload).execute()
    except Exception:
        pass


def log_metrics(tag: str, metrics: Dict[str, Any]) -> None:
    extra = {"metrics": metrics, "tag": tag}
    log_event("metrics", extra)


def log_json_blob(event_type: str, blob: Dict[str, Any]) -> None:
    # Helper used by Flower server to dump configs or summaries
    log_event(event_type, blob)


def flush_model_summary(path: str, metadata: Optional[Dict[str, Any]] = None) -> None:
    client = _get_client()
    if client is None:
        return
    payload = _base_payload()
    info = metadata or {}
    info["path"] = path
    payload.update({"event_type": "model_artifact", "payload": info, "created_at": datetime.utcnow().isoformat()})
    try:
        client.table("federated_events").insert(payload).execute()
    except Exception:
        pass
