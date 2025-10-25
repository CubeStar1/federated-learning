"""Minimal FastAPI admin server to control Flower SuperLink and runs."""

from __future__ import annotations

import asyncio
from datetime import datetime, UTC
from pathlib import Path
import os
import re
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
FLOWER_APP_PATH = BASE_DIR / "flower-app"
LOG_DIR = Path("logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SUPERLINK_LOG = LOG_DIR / "superlink.log"
DEFAULT_RUN_LOG = LOG_DIR / "run.log"

ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")


class SuperlinkStartRequest(BaseModel):
	insecure: bool = True
	certificates_path: Optional[str] = None
	extra_args: list[str] = Field(default_factory=list)


class RunStartRequest(BaseModel):
	federation_name: str = "production"
	stream: bool = True
	extra_args: list[str] = Field(default_factory=list)


class ProcessManager:
	def __init__(self) -> None:
		self.superlink_process: Optional[asyncio.subprocess.Process] = None
		self.superlink_stream_tasks: list[asyncio.Task] = []
		self.superlink_monitor: Optional[asyncio.Task] = None
		self.superlink_log: Path = DEFAULT_SUPERLINK_LOG
		self.superlink_started_at: Optional[datetime] = None

		self.run_process: Optional[asyncio.subprocess.Process] = None
		self.run_stream_tasks: list[asyncio.Task] = []
		self.run_monitor: Optional[asyncio.Task] = None
		self.run_log: Path = DEFAULT_RUN_LOG
		self.run_info: Optional[dict[str, str]] = None

	async def start_superlink(self, request: SuperlinkStartRequest) -> dict[str, str]:
		if self.superlink_process:
			raise HTTPException(status_code=400, detail="SuperLink already running")

		project_path = FLOWER_APP_PATH
		if not project_path.exists():
			raise HTTPException(status_code=500, detail="Configured flower-app path not found")

		log_path = self._normalize_log_path(None, DEFAULT_SUPERLINK_LOG)

		cmd = ["flower-superlink", *request.extra_args]
		if request.insecure:
			cmd.append("--insecure")
		elif request.certificates_path:
			cmd.extend(["--certificates", request.certificates_path])

		process = await asyncio.create_subprocess_exec(
			*cmd,
			cwd=str(project_path),
			stdout=asyncio.subprocess.PIPE,
			stderr=asyncio.subprocess.PIPE,
			env=self._build_env(),
		)

		if process.stdout is None or process.stderr is None:
			raise HTTPException(status_code=500, detail="Failed to capture process output")

		self.superlink_process = process
		self.superlink_log = log_path
		self.superlink_started_at = datetime.now(UTC)
		self.superlink_stream_tasks = [
			asyncio.create_task(self._stream_to_file(process.stdout, log_path)),
			asyncio.create_task(self._stream_to_file(process.stderr, log_path)),
		]
		self.superlink_monitor = asyncio.create_task(
			self._monitor_process(process, "superlink", log_path)
		)

		await self._append_line(log_path, f"[{self._timestamp()}] superlink started (pid={process.pid})\n")
		return {
			"status": "running",
			"pid": str(process.pid),
			"log_path": str(log_path),
		}

	async def stop_superlink(self) -> dict[str, str]:
		if not self.superlink_process:
			raise HTTPException(status_code=400, detail="SuperLink not running")

		await self._append_line(self.superlink_log, f"[{self._timestamp()}] superlink stop requested\n")
		await self._terminate_process(self.superlink_process)
		await self._finalize_streams(self.superlink_stream_tasks)
		if self.superlink_monitor:
			await self.superlink_monitor
		self.superlink_process = None
		self.superlink_monitor = None
		self.superlink_started_at = None
		return {"status": "stopped"}

	async def start_run(self, request: RunStartRequest) -> dict[str, str]:
		if not self.superlink_process:
			raise HTTPException(status_code=400, detail="SuperLink must be running")
		if self.run_process:
			raise HTTPException(status_code=400, detail="Another run is active")

		project_path = FLOWER_APP_PATH
		if not project_path.exists():
			raise HTTPException(status_code=500, detail="Configured flower-app path not found")

		log_path = self._normalize_log_path(None, DEFAULT_RUN_LOG)

		cmd = ["flwr", "run", ".", request.federation_name, *request.extra_args]
		if request.stream:
			cmd.append("--stream")

		process = await asyncio.create_subprocess_exec(
			*cmd,
			cwd=str(project_path),
			stdout=asyncio.subprocess.PIPE,
			stderr=asyncio.subprocess.PIPE,
			env=self._build_env(),
		)

		if process.stdout is None or process.stderr is None:
			raise HTTPException(status_code=500, detail="Failed to capture process output")

		self.run_process = process
		self.run_log = log_path
		started_at = datetime.now(UTC)
		self.run_info = {
			"federation_name": request.federation_name,
			"started_at": started_at.isoformat(),
			"pid": str(process.pid),
			"log_path": str(log_path),
		}
		self.run_stream_tasks = [
			asyncio.create_task(self._stream_to_file(process.stdout, log_path)),
			asyncio.create_task(self._stream_to_file(process.stderr, log_path)),
		]
		self.run_monitor = asyncio.create_task(self._monitor_process(process, "run", log_path))

		await self._append_line(log_path, f"[{self._timestamp()}] run started (pid={process.pid})\n")
		return {"status": "running", "pid": str(process.pid), "log_path": str(log_path)}

	async def stop_run(self) -> dict[str, str]:
		if not self.run_process:
			raise HTTPException(status_code=400, detail="No active run")

		await self._append_line(self.run_log, f"[{self._timestamp()}] run stop requested\n")
		await self._terminate_process(self.run_process)
		await self._finalize_streams(self.run_stream_tasks)
		if self.run_monitor:
			await self.run_monitor
		self.run_process = None
		self.run_monitor = None
		self.run_info = None
		return {"status": "stopped"}

	async def _monitor_process(
		self,
		process: asyncio.subprocess.Process,
		kind: str,
		log_path: Path,
	) -> None:
		returncode = await process.wait()
		await self._append_line(
			log_path,
			f"[{self._timestamp()}] {kind} exited with code {returncode}\n",
		)
		if kind == "superlink":
			await self._finalize_streams(self.superlink_stream_tasks)
			self.superlink_process = None
			self.superlink_monitor = None
			self.superlink_started_at = None
		else:
			await self._finalize_streams(self.run_stream_tasks)
			self.run_process = None
			self.run_monitor = None
			self.run_info = None

	async def _stream_to_file(self, stream: asyncio.StreamReader, log_path: Path) -> None:
		while True:
			line = await stream.readline()
			if not line:
				break
			text = line.decode("utf-8", "ignore")
			clean = ANSI_ESCAPE_RE.sub("", text)
			await self._append_line(log_path, clean)

	async def _append_line(self, log_path: Path, text: str) -> None:
		def _write() -> None:
			log_path.parent.mkdir(parents=True, exist_ok=True)
			with log_path.open("a", encoding="utf-8") as handle:
				handle.write(text)

		await asyncio.to_thread(_write)

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

	@staticmethod
	def _build_env() -> dict[str, str]:
		env = os.environ.copy()
		env.setdefault("PYTHONIOENCODING", "utf-8")
		env.setdefault("LC_ALL", "C.UTF-8")
		env.setdefault("LANG", "C.UTF-8")
		return env


STATE = ProcessManager()

app = FastAPI(title="Flower Admin Server")
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, Optional[str]]:
	return {
		"superlink_running": bool(STATE.superlink_process),
		"run_active": bool(STATE.run_process),
		"superlink_started_at": STATE.superlink_started_at.isoformat()
		if STATE.superlink_started_at
		else None,
		"run_info": STATE.run_info,
	}


@app.post("/superlink/start")
async def start_superlink(request: SuperlinkStartRequest) -> dict[str, str]:
	return await STATE.start_superlink(request)


@app.post("/superlink/stop")
async def stop_superlink() -> dict[str, str]:
	return await STATE.stop_superlink()


@app.post("/runs/start")
async def start_run(request: RunStartRequest) -> dict[str, str]:
	return await STATE.start_run(request)


@app.post("/runs/stop")
async def stop_run() -> dict[str, str]:
	return await STATE.stop_run()


@app.get("/runs/active")
async def active_run() -> dict[str, Optional[dict[str, str]]]:
	return {"run": STATE.run_info}


if __name__ == "__main__":
	import uvicorn

	uvicorn.run(app, host="0.0.0.0", port=8000)
