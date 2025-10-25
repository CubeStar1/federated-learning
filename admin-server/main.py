from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils.config import SETTINGS
from utils.process_manager import ProcessManager
from utils.schemas import RunStartRequest, SuperlinkStartRequest
from utils.supabase import SupabaseAsync


SUPABASE = SupabaseAsync(SETTINGS.supabase_url, SETTINGS.supabase_key)
STATE = ProcessManager(SETTINGS, SUPABASE)

app = FastAPI(title="Flower Admin Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=SETTINGS.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    await STATE.initialize()


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "superlink_running": bool(STATE.superlink_process),
        "run_active": bool(STATE.run_process),
        "superlink_started_at": STATE.superlink_started_at.isoformat()
        if STATE.superlink_started_at
        else None,
        "run_info": STATE.run_info,
        "project_id": STATE.project_id,
    }


@app.post("/superlink/start")
async def start_superlink(request: SuperlinkStartRequest) -> dict[str, str]:
    return await STATE.start_superlink(request)


@app.post("/superlink/stop")
async def stop_superlink() -> dict[str, str]:
    return await STATE.stop_superlink()


@app.post("/runs/start")
async def start_run(request: RunStartRequest) -> dict[str, str]:
    return await STATE.start_run(request)


@app.post("/runs/stop")
async def stop_run() -> dict[str, str]:
    return await STATE.stop_run()


@app.get("/runs/active")
async def active_run() -> dict[str, Any]:
    return {"run": STATE.run_info}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
