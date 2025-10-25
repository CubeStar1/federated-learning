from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SuperlinkStartRequest(BaseModel):
    insecure: bool = True
    certificates_path: Optional[str] = None
    listen_address: Optional[str] = None
    extra_args: list[str] = Field(default_factory=list)


class RunStartRequest(BaseModel):
    federation_name: str = "production"
    stream: bool = True
    extra_args: list[str] = Field(default_factory=list)


__all__ = ["RunStartRequest", "SuperlinkStartRequest"]
