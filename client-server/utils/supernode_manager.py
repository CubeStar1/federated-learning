from __future__ import annotations

import asyncio
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING, Optional

from fastapi import HTTPException

from .config import Settings
from .constants import ANSI_ESCAPE_RE, DEFAULT_SUPERNODE_LOG, FLOWER_APP_PATH
from .supabase import SupabaseAsync

if TYPE_CHECKING:
    from .schemas import SupernodeStartRequest


class SupernodeManager:
    def __init__(self, settings: Settings, supabase: SupabaseAsync) -> None:
        self.settings = settings
        self.supabase = supabase

        self.process: Optional[asyncio.subprocess.Process] = None
        self.stream_tasks: list[asyncio.Task] = []
        self.monitor: Optional[asyncio.Task] = None
        self.log_path: Path = DEFAULT_SUPERNODE_LOG
        self.session_id: Optional[str] = None
        self.started_at: Optional[datetime] = None

        self.default_project_id: Optional[str] = None
        self.default_node_id: Optional[str] = None
        self.active_project_id: Optional[str] = None
        self.active_node_id: Optional[str] = None
        self.active_user_id: Optional[str] = None
        self.initialized: bool = False
        self.session_logs: dict[str, str] = {}

    @property
    def project_id(self) -> Optional[str]:
        return self.active_project_id or self.default_project_id

    @property
    def node_id(self) -> Optional[str]:
        return self.active_node_id or self.default_node_id

    @property
    def user_id(self) -> Optional[str]:
        return self.active_user_id

    async def initialize(self) -> None:
        if self.initialized:
            return
        if not self.supabase.enabled:
            self.initialized = True
            return

        project = await self.supabase.fetch_one("projects", {"slug": self.settings.project_slug})
        if project:
            self.default_project_id = project["id"]
            os.environ.setdefault("PROJECT_ID", self.default_project_id)
            os.environ.setdefault("PROJECT_SLUG", self.settings.project_slug)

            node = await self.supabase.fetch_one(
                "nodes",
                {"external_id": self.settings.participant_external_id},
            )
            if node and node.get("project_id") == self.default_project_id:
                self.default_node_id = node["id"]

        self.initialized = True

    async def start_supernode(self, request: SupernodeStartRequest) -> dict[str, str]:
        await self.initialize()
        if self.process:
            raise HTTPException(status_code=400, detail="SuperNode already running")
        if not FLOWER_APP_PATH.exists():
            raise HTTPException(status_code=500, detail="Configured flower-app path not found")

        project_id = request.project_id or self.active_project_id or self.default_project_id
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")

        node_id = request.node_id or self.active_node_id or self.default_node_id
        if not node_id:
            raise HTTPException(status_code=400, detail="node_id is required")

        user_id = request.user_id or self.active_user_id

        self.active_project_id = project_id
        self.active_node_id = node_id
        if request.user_id:
            self.active_user_id = request.user_id

        node_config = f"partition-id={request.partition_id} num-partitions={request.num_partitions}"

        self.session_id = None
        cmd = [
            "flower-supernode",
            "--superlink",
            request.superlink_address,
            "--clientappio-api-address",
            request.clientappio_api_address,
            "--node-config",
            node_config,
            *request.extra_args,
        ]
        if request.insecure:
            cmd.append("--insecure")
        elif request.certificates_path:
            cmd.extend(["--root-certificates", request.certificates_path])

        session_id: Optional[str] = None
        if self.supabase.enabled:
            session = await self.supabase.insert(
                "node_sessions",
                {
                    "node_id": node_id,
                    "status": "starting",
                    "runtime_config": {
                        "superlink_address": request.superlink_address,
                        "supernode_address": request.clientappio_api_address,
                        "partition_id": request.partition_id,
                        "num_partitions": request.num_partitions,
                        "node_config": node_config,
                        "project_id": project_id,
                        "node_id": node_id,
                        **({"user_id": user_id} if user_id else {}),
                    },
                    "log_stream": "",
                },
            )
            if session:
                session_id = session["id"]
                self.session_id = session_id
                self.session_logs[session_id] = ""

        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(FLOWER_APP_PATH),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=self._build_env(),
        )

        if process.stdout is None or process.stderr is None:
            raise HTTPException(status_code=500, detail="Failed to capture process output")

        self.process = process
        self.log_path = DEFAULT_SUPERNODE_LOG
        self.started_at = datetime.now(UTC)

        if session_id and self.supabase.enabled:
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {
                    "status": "running",
                    "pid": process.pid,
                    "started_at": self.started_at.isoformat(),
                },
            )

        self.stream_tasks = [
            asyncio.create_task(
                self._stream_to_file(
                    process.stdout,
                    self.log_path,
                    session_id=session_id,
                )
            ),
            asyncio.create_task(
                self._stream_to_file(
                    process.stderr,
                    self.log_path,
                    session_id=session_id,
                )
            ),
        ]

        self.monitor = asyncio.create_task(
            self._monitor_process(
                process,
                self.log_path,
                session_id=session_id,
            )
        )

        await self._append_log(
            self.log_path,
            f"[{self._timestamp()}] supernode started (pid={process.pid})\n",
            session_id=session_id,
        )

        return {
            "status": "running",
            "pid": str(process.pid),
            "log_path": str(self.log_path),
            "session_id": session_id or "",
        }

    async def stop_supernode(self) -> dict[str, str]:
        if not self.process:
            raise HTTPException(status_code=400, detail="SuperNode not running")

        await self._append_log(
            self.log_path,
            f"[{self._timestamp()}] supernode stop requested\n",
            session_id=self.session_id,
        )
        await self._terminate_process(self.process)
        await self._finalize_streams(self.stream_tasks)
        if self.monitor:
            await self.monitor

        self.process = None
        self.monitor = None
        self.started_at = None
        self.session_id = None

        self.active_project_id = None
        self.active_node_id = None
        self.active_user_id = None
        return {"status": "stopped"}

    async def _monitor_process(
        self,
        process: asyncio.subprocess.Process,
        log_path: Path,
        *,
        session_id: Optional[str],
    ) -> None:
        returncode = await process.wait()
        status = "completed" if returncode == 0 else "failed"
        finished_at = datetime.now(UTC).isoformat()

        await self._finalize_streams(self.stream_tasks)
        await self._append_log(
            log_path,
            f"[{self._timestamp()}] supernode exited with code {returncode}\n",
            session_id=session_id,
        )

        if session_id and self.supabase.enabled:
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {"status": status, "ended_at": finished_at},
            )
            self.session_logs.pop(session_id, None)
        self.process = None
        self.monitor = None
        self.started_at = None
        self.session_id = None
        self.active_project_id = None
        self.active_node_id = None
        self.active_user_id = None

    async def _stream_to_file(
        self,
        stream: asyncio.StreamReader,
        log_path: Path,
        *,
        session_id: Optional[str],
    ) -> None:
        while True:
            line = await stream.readline()
            if not line:
                break
            text = line.decode("utf-8", "ignore")
            clean = ANSI_ESCAPE_RE.sub("", text)
            await self._append_log(log_path, clean, session_id=session_id)

    async def _append_log(self, log_path: Path, text: str, *, session_id: Optional[str]) -> None:
        def _write() -> None:
            log_path.parent.mkdir(parents=True, exist_ok=True)
            with log_path.open("a", encoding="utf-8") as handle:
                handle.write(text)

        await asyncio.to_thread(_write)

        if not self.supabase.enabled or not session_id:
            return

        buffer = self.session_logs.get(session_id, "") + text
        self.session_logs[session_id] = buffer
        await self.supabase.update(
            "node_sessions",
            {"id": session_id},
            {"log_stream": buffer},
        )

    async def _finalize_streams(self, tasks: list[asyncio.Task]) -> None:
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        tasks.clear()

    async def _terminate_process(self, process: asyncio.subprocess.Process) -> None:
        process.terminate()
        try:
            await asyncio.wait_for(process.wait(), timeout=10)
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()

    def _build_env(self, extra: Optional[dict[str, str]] = None) -> dict[str, str]:
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("LC_ALL", "C.UTF-8")
        env.setdefault("LANG", "C.UTF-8")
        env.setdefault("PROJECT_SLUG", self.settings.project_slug)
        env.setdefault("NODE_EXTERNAL_ID", self.settings.participant_external_id)
        if self.settings.supabase_url:
            env["SUPABASE_URL"] = self.settings.supabase_url
        if self.settings.supabase_key:
            env["SUPABASE_KEY"] = self.settings.supabase_key
        if extra:
            env.update({k: v for k, v in extra.items() if v is not None})
        return env

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(UTC).isoformat()


__all__ = ["SupernodeManager"]
