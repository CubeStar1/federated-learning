from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils.config import SETTINGS
from utils.schemas import SupernodeStartRequest
from utils.supabase import SupabaseAsync
from utils.supernode_manager import SupernodeManager


SUPABASE = SupabaseAsync(SETTINGS.supabase_url, SETTINGS.supabase_key)
STATE = SupernodeManager(SETTINGS, SUPABASE)

app = FastAPI(title="Flower Client Server")
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
        "supernode_running": bool(STATE.process),
        "started_at": STATE.started_at.isoformat() if STATE.started_at else None,
        "log_path": str(STATE.log_path),
        "session_id": STATE.session_id,
        "project_id": STATE.project_id,
        "node_id": STATE.node_id,
        "user_id": STATE.user_id,
    }


@app.post("/supernode/start")
async def start_supernode(request: SupernodeStartRequest) -> dict[str, str]:
    return await STATE.start_supernode(request)


@app.post("/supernode/stop")
async def stop_supernode() -> dict[str, str]:
    return await STATE.stop_supernode()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)