
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SupernodeStartRequest(BaseModel):
    superlink_address: str
    partition_id: int
    num_partitions: int
    clientappio_api_address: str = "0.0.0.0:9094"
    insecure: bool = True
    certificates_path: Optional[str] = None
    extra_args: list[str] = Field(default_factory=list)


__all__ = ["SupernodeStartRequest"]
