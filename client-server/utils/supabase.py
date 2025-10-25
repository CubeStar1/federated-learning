from __future__ import annotations

import asyncio
from typing import Any, Optional

from supabase import Client, create_client


class SupabaseAsync:
    def __init__(self, url: Optional[str], key: Optional[str]) -> None:
        self._client: Optional[Client] = create_client(url, key) if url and key else None

    @property
    def enabled(self) -> bool:
        return self._client is not None

    async def insert(self, table: str, payload: dict[str, Any]) -> Optional[dict[str, Any]]:
        if not self.enabled:
            return None

        def _run() -> Any:
            return self._client.table(table).insert(payload).execute()

        try:
            response = await asyncio.to_thread(_run)
        except Exception:
            return None
        data = response.data or []
        return data[0] if data else None

    async def update(self, table: str, filters: dict[str, Any], values: dict[str, Any]) -> None:
        if not self.enabled:
            return

        def _run() -> Any:
            query = self._client.table(table).update(values)
            for key, value in filters.items():
                query = query.eq(key, value)
            return query.execute()

        try:
            await asyncio.to_thread(_run)
        except Exception:
            pass

    async def fetch_one(self, table: str, filters: dict[str, Any]) -> Optional[dict[str, Any]]:
        if not self.enabled:
            return None

        def _run() -> Any:
            query = self._client.table(table).select("*").limit(1)
            for key, value in filters.items():
                query = query.eq(key, value)
            return query.execute()

        try:
            response = await asyncio.to_thread(_run)
        except Exception:
            return None
        data = response.data or []
        return data[0] if data else None


__all__ = ["SupabaseAsync"]
