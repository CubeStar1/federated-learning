"""Shared utilities for model factories."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Mapping, Optional


BuilderFn = Callable[[Dict[str, Any]], Any]


@dataclass(frozen=True)
class ModelFactory:
    name: str
    label: str
    description: str
    defaults: Mapping[str, Any]
    builder: BuilderFn

    def build(self, overrides: Optional[Dict[str, Any]] = None):
        params: Dict[str, Any] = dict(self.defaults)
        if overrides:
            params.update(overrides)
        return self.builder(params)

