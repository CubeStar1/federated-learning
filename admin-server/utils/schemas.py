from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SuperlinkStartRequest(BaseModel):
    project_id: Optional[str] = None
    node_id: Optional[str] = None
    user_id: Optional[str] = None
    insecure: bool = True
    certificates_path: Optional[str] = None
    listen_address: Optional[str] = None
    extra_args: list[str] = Field(default_factory=list)


class RunStartRequest(BaseModel):
    project_id: Optional[str] = None
    coordinator_node_id: Optional[str] = None
    user_id: Optional[str] = None
    federation_name: str = "production"
    stream: bool = True
    extra_args: list[str] = Field(default_factory=list)


__all__ = ["RunStartRequest", "SuperlinkStartRequest"]
