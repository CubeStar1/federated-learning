from __future__ import annotations

import os
import socket
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()


class Settings(BaseModel):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    project_slug: str = "fed-project"
    project_name: str = "Federated Project"
    participant_external_id: str = Field(default_factory=lambda: f"participant-{socket.gethostname()}")
    participant_display_name: str = Field(default_factory=socket.gethostname)
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])


def load_settings() -> Settings:
    origins = [origin.strip() for origin in os.getenv("CLIENT_CORS", "*").split(",") if origin.strip()]
    return Settings(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        project_slug=os.getenv("PROJECT_SLUG", "fed-project"),
        project_name=os.getenv("PROJECT_NAME", "Federated Project"),
        participant_external_id=os.getenv("PARTICIPANT_NODE_ID", f"participant-{socket.gethostname()}"),
        participant_display_name=os.getenv("PARTICIPANT_NODE_NAME", socket.gethostname()),
        cors_origins=origins or ["*"],
    )


def apply_supabase_defaults(settings: Settings) -> None:
    if settings.supabase_url:
        os.environ.setdefault("SUPABASE_URL", settings.supabase_url)
    if settings.supabase_key:
        os.environ.setdefault("SUPABASE_KEY", settings.supabase_key)


SETTINGS = load_settings()
apply_supabase_defaults(SETTINGS)


__all__ = [
    "SETTINGS",
    "Settings",
    "apply_supabase_defaults",
    "load_settings",
]
