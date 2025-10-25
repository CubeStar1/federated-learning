from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    project_slug: str = "fed-project"
    project_name: str = "Federated Project"
    coordinator_external_id: str = "coordinator-node"
    coordinator_display_name: str = "Coordinator"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])


def load_settings() -> Settings:
    origins = [origin.strip() for origin in os.getenv("ADMIN_CORS", "*").split(",") if origin.strip()]
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        project_slug=os.getenv("PROJECT_SLUG", "fed-project"),
        project_name=os.getenv("PROJECT_NAME", "Federated Project"),
        coordinator_external_id=os.getenv("COORDINATOR_NODE_ID", "coordinator-node"),
        coordinator_display_name=os.getenv("COORDINATOR_NODE_NAME", "Coordinator"),
        cors_origins=origins or ["*"],
    )


SETTINGS = load_settings()


__all__ = [
    "SETTINGS",
    "Settings",
    "load_settings",
]
