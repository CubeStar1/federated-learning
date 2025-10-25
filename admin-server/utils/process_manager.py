from __future__ import annotations

import asyncio
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any, Optional

from fastapi import HTTPException

from .config import Settings
from .constants import (
    ANSI_ESCAPE_RE,
    DEFAULT_RUN_LOG,
    DEFAULT_SUPERLINK_LOG,
    FLOWER_APP_PATH,
)
from .supabase import SupabaseAsync

if TYPE_CHECKING:
    from .schemas import RunStartRequest, SuperlinkStartRequest


class ProcessManager:
    def __init__(self, settings: Settings, supabase: SupabaseAsync) -> None:
        self.settings = settings
        self.supabase = supabase

        self.superlink_process: Optional[asyncio.subprocess.Process] = None
        self.superlink_stream_tasks: list[asyncio.Task] = []
        self.superlink_monitor: Optional[asyncio.Task] = None
        self.superlink_log: Path = DEFAULT_SUPERLINK_LOG
        self.superlink_started_at: Optional[datetime] = None
        self.superlink_session_id: Optional[str] = None

        self.run_process: Optional[asyncio.subprocess.Process] = None
        self.run_stream_tasks: list[asyncio.Task] = []
        self.run_monitor: Optional[asyncio.Task] = None
        self.run_log: Path = DEFAULT_RUN_LOG
        self.run_info: Optional[dict[str, str]] = None
        self.run_session_id: Optional[str] = None
        self.run_id: Optional[str] = None
        self.pyproject_path: Path = FLOWER_APP_PATH / "pyproject.toml"

        self.project_id: Optional[str] = None
        self.coordinator_node_id: Optional[str] = None
        self.initialized: bool = False
        self.session_logs: dict[str, str] = {}
        self.run_logs: dict[str, str] = {}

    async def initialize(self) -> None:
        if self.initialized:
            return
        if not self.supabase.enabled:
            self.initialized = True
            return

        project = await self.supabase.fetch_one("projects", {"slug": self.settings.project_slug})
        if not project:
            project = await self.supabase.insert(
                "projects",
                {
                    "slug": self.settings.project_slug,
                    "name": self.settings.project_name,
                },
            )
            if not project:
                project = await self.supabase.fetch_one("projects", {"slug": self.settings.project_slug})
        if project:
            self.project_id = project["id"]

        node = await self.supabase.fetch_one("nodes", {"external_id": self.settings.coordinator_external_id})
        if not node and self.project_id:
            node = await self.supabase.insert(
                "nodes",
                {
                    "project_id": self.project_id,
                    "external_id": self.settings.coordinator_external_id,
                    "role": "coordinator",
                    "display_name": self.settings.coordinator_display_name,
                },
            )
            if not node:
                node = await self.supabase.fetch_one("nodes", {"external_id": self.settings.coordinator_external_id})
        if node:
            self.coordinator_node_id = node["id"]

        self.initialized = True

    async def start_superlink(self, request: SuperlinkStartRequest) -> dict[str, str]:
        await self.initialize()
        if self.superlink_process:
            raise HTTPException(status_code=400, detail="SuperLink already running")
        if not FLOWER_APP_PATH.exists():
            raise HTTPException(status_code=500, detail="Configured flower-app path not found")

        log_path = DEFAULT_SUPERLINK_LOG

        cmd = ["flower-superlink", *request.extra_args]
        if request.insecure:
            cmd.append("--insecure")
        elif request.certificates_path:
            cmd.extend(["--certificates", request.certificates_path])

        session_id: Optional[str] = None
        if self.supabase.enabled and self.coordinator_node_id:
            runtime_config: dict[str, Any] = {"command": " ".join(cmd)}
            if request.listen_address:
                runtime_config["address"] = request.listen_address
            session = await self.supabase.insert(
                "node_sessions",
                {
                    "node_id": self.coordinator_node_id,
                    "status": "starting",
                    "runtime_config": runtime_config,
                    "log_stream": "",
                },
            )
            if session:
                session_id = session["id"]
                self.superlink_session_id = session_id
                self.session_logs[session_id] = ""

        env = self._build_env()

        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(FLOWER_APP_PATH),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )

        if process.stdout is None or process.stderr is None:
            raise HTTPException(status_code=500, detail="Failed to capture process output")

        self.superlink_process = process
        self.superlink_log = log_path
        self.superlink_started_at = datetime.now(UTC)

        if session_id and self.supabase.enabled:
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {
                    "status": "running",
                    "pid": process.pid,
                    "started_at": datetime.now(UTC).isoformat(),
                },
            )

        self.superlink_stream_tasks = [
            asyncio.create_task(
                self._stream_to_file(
                    process.stdout,
                    log_path,
                    session_id=session_id,
                )
            ),
            asyncio.create_task(
                self._stream_to_file(
                    process.stderr,
                    log_path,
                    session_id=session_id,
                )
            ),
        ]

        self.superlink_monitor = asyncio.create_task(
            self._monitor_process(
                process,
                "superlink",
                log_path,
                session_id=session_id,
            )
        )

        await self._append_log(
            log_path,
            f"[{self._timestamp()}] superlink started (pid={process.pid})\n",
            session_id=session_id,
        )

        return {
            "status": "running",
            "pid": str(process.pid),
            "log_path": str(log_path),
            "session_id": session_id or "",
        }

    async def stop_superlink(self) -> dict[str, str]:
        if not self.superlink_process:
            raise HTTPException(status_code=400, detail="SuperLink not running")

        await self._append_log(
            self.superlink_log,
            f"[{self._timestamp()}] superlink stop requested\n",
            session_id=self.superlink_session_id,
        )

        await self._terminate_process(self.superlink_process)
        await self._finalize_streams(self.superlink_stream_tasks)
        if self.superlink_monitor:
            await self.superlink_monitor
        self.superlink_process = None
        self.superlink_monitor = None
        self.superlink_started_at = None
        self.superlink_session_id = None
        return {"status": "stopped"}

    async def start_run(self, request: RunStartRequest) -> dict[str, str]:
        await self.initialize()
        if not self.superlink_process:
            raise HTTPException(status_code=400, detail="SuperLink must be running")
        if self.run_process:
            raise HTTPException(status_code=400, detail="Another run is active")
        if not FLOWER_APP_PATH.exists():
            raise HTTPException(status_code=500, detail="Configured flower-app path not found")

        cmd = ["flwr", "run", ".", request.federation_name, *request.extra_args]
        if request.stream:
            cmd.append("--stream")

        session_id: Optional[str] = None
        if self.supabase.enabled and self.coordinator_node_id:
            session = await self.supabase.insert(
                "node_sessions",
                {
                    "node_id": self.coordinator_node_id,
                    "status": "starting",
                    "runtime_config": {
                        "federation_name": request.federation_name,
                        "extra_args": request.extra_args,
                    },
                    "log_stream": "",
                },
            )
            if session:
                session_id = session["id"]
                self.run_session_id = session_id
                self.session_logs[session_id] = ""

        run_id: Optional[str] = None
        if self.supabase.enabled and self.project_id:
            run = await self.supabase.insert(
                "federated_runs",
                {
                    "project_id": self.project_id,
                    "status": "starting",
                    "label": request.federation_name,
                    "config": {"federation_name": request.federation_name, "stream": request.stream},
                    "log_stream": "",
                    "metrics": {},
                },
            )
            if run:
                run_id = run["id"]
                self.run_id = run_id
                self.run_logs[run_id] = ""

        self._set_pyproject_run_id(run_id)

        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=str(FLOWER_APP_PATH),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=self._build_env(),
        )

        if process.stdout is None or process.stderr is None:
            raise HTTPException(status_code=500, detail="Failed to capture process output")

        self.run_process = process
        self.run_log = DEFAULT_RUN_LOG
        started_at = datetime.now(UTC)
        self.run_info = {
            "federation_name": request.federation_name,
            "started_at": started_at.isoformat(),
            "pid": str(process.pid),
            "log_path": str(self.run_log),
            "run_id": run_id or "",
        }

        if session_id and self.supabase.enabled:
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {
                    "status": "running",
                    "pid": process.pid,
                    "started_at": started_at.isoformat(),
                },
            )
        if run_id and self.supabase.enabled:
            await self.supabase.update(
                "federated_runs",
                {"id": run_id},
                {
                    "status": "running",
                    "started_at": started_at.isoformat(),
                    "coordinator_session_id": session_id,
                },
            )

        self.run_stream_tasks = [
            asyncio.create_task(
                self._stream_to_file(
                    process.stdout,
                    self.run_log,
                    session_id=session_id,
                    run_id=run_id,
                )
            ),
            asyncio.create_task(
                self._stream_to_file(
                    process.stderr,
                    self.run_log,
                    session_id=session_id,
                    run_id=run_id,
                )
            ),
        ]

        self.run_monitor = asyncio.create_task(
            self._monitor_process(
                process,
                "run",
                self.run_log,
                session_id=session_id,
                run_id=run_id,
            )
        )
        await self._append_log(
            self.run_log,
            f"[{self._timestamp()}] run started (pid={process.pid})\n",
            session_id=session_id,
            run_id=run_id,
        )

        return {
            "status": "running",
            "pid": str(process.pid),
            "log_path": str(self.run_log),
            "run_id": run_id or "",
            "session_id": session_id or "",
        }

    async def stop_run(self) -> dict[str, str]:
        if not self.run_process:
            raise HTTPException(status_code=400, detail="No active run")

        await self._append_log(
            self.run_log,
            f"[{self._timestamp()}] run stop requested\n",
            session_id=self.run_session_id,
            run_id=self.run_id,
        )

        await self._terminate_process(self.run_process)
        await self._finalize_streams(self.run_stream_tasks)
        if self.run_monitor:
            await self.run_monitor
        self.run_process = None
        self.run_monitor = None
        self.run_info = None
        self.run_session_id = None
        self.run_id = None
        self._set_pyproject_run_id(None)
        return {"status": "stopped"}

    async def _monitor_process(
        self,
        process: asyncio.subprocess.Process,
        kind: str,
        log_path: Path,
        *,
        session_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> None:
        returncode = await process.wait()
        status = "completed" if returncode == 0 else "failed"
        finished_at = datetime.now(UTC).isoformat()

        if kind == "run":
            await self._finalize_streams(self.run_stream_tasks)
        else:
            await self._finalize_streams(self.superlink_stream_tasks)

        await self._append_log(
            log_path,
            f"[{self._timestamp()}] {kind} exited with code {returncode}\n",
            session_id=session_id,
            run_id=run_id,
        )

        if session_id and self.supabase.enabled:
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {"status": status, "ended_at": finished_at},
            )
            self.session_logs.pop(session_id, None)

        if kind == "run":
            if run_id and self.supabase.enabled:
                await self.supabase.update(
                    "federated_runs",
                    {"id": run_id},
                    {"status": status, "ended_at": finished_at},
                )
                self.run_logs.pop(run_id, None)
            self.run_process = None
            self.run_monitor = None
            self.run_info = None
            self.run_session_id = None
            self.run_id = None
            self._set_pyproject_run_id(None)
        else:
            self.superlink_process = None
            self.superlink_monitor = None
            self.superlink_started_at = None
            self.superlink_session_id = None

    async def _stream_to_file(
        self,
        stream: asyncio.StreamReader,
        log_path: Path,
        *,
        session_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> None:
        while True:
            line = await stream.readline()
            if not line:
                break
            text = line.decode("utf-8", "ignore")
            clean = ANSI_ESCAPE_RE.sub("", text)
            await self._append_log(log_path, clean, session_id=session_id, run_id=run_id)

    async def _append_log(
        self,
        log_path: Path,
        text: str,
        *,
        session_id: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> None:
        def _write() -> None:
            log_path.parent.mkdir(parents=True, exist_ok=True)
            with log_path.open("a", encoding="utf-8") as handle:
                handle.write(text)

        await asyncio.to_thread(_write)

        if not self.supabase.enabled:
            return

        if session_id:
            buffer = self.session_logs.get(session_id, "") + text
            self.session_logs[session_id] = buffer
            await self.supabase.update(
                "node_sessions",
                {"id": session_id},
                {"log_stream": buffer},
            )

        if run_id:
            buffer = self.run_logs.get(run_id, "") + text
            self.run_logs[run_id] = buffer
            await self.supabase.update(
                "federated_runs",
                {"id": run_id},
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

    def _normalize_log_path(self, log_path: Optional[str], default: Path) -> Path:
        if log_path:
            path = Path(log_path).expanduser()
        else:
            path = default
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(UTC).isoformat()

    def _build_env(self, extra: Optional[dict[str, str]] = None) -> dict[str, str]:
        env = os.environ.copy()
        env.setdefault("PYTHONIOENCODING", "utf-8")
        env.setdefault("LC_ALL", "C.UTF-8")
        env.setdefault("LANG", "C.UTF-8")
        if extra:
            env.update({k: v for k, v in extra.items() if v is not None})
        return env

    def _set_pyproject_run_id(self, run_id: Optional[str]) -> None:
        try:
            if not self.pyproject_path.exists():
                return
            txt = self.pyproject_path.read_text(encoding="utf-8")
        except Exception:
            return

        lines = txt.splitlines()
        config_start = None
        for idx, line in enumerate(lines):
            if line.strip() == "[tool.flwr.app.config]":
                config_start = idx
                break
        if config_start is None:
            return

        config_end = len(lines)
        for idx in range(config_start + 1, len(lines)):
            if lines[idx].startswith("[") and lines[idx].strip().startswith("["):
                config_end = idx
                break

        existing_index = None
        for idx in range(config_start + 1, config_end):
            if lines[idx].strip().startswith("current-run-id"):
                existing_index = idx
                break

        if run_id:
            entry = f"current-run-id = \"{run_id}\""
            if existing_index is not None:
                lines[existing_index] = entry
            else:
                insert_at = config_end
                while insert_at > config_start + 1 and not lines[insert_at - 1].strip():
                    insert_at -= 1
                lines.insert(insert_at, entry)
        else:
            if existing_index is not None:
                lines.pop(existing_index)

        try:
            self.pyproject_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        except Exception:
            return


__all__ = ["ProcessManager"]
