"""Minimal FastAPI client server to control Flower SuperNodes."""

from __future__ import annotations

import asyncio
from datetime import datetime
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
DEFAULT_SUPERNODE_LOG = LOG_DIR / "supernode.log"

ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")


class SupernodeStartRequest(BaseModel):
	superlink_address: str
	partition_id: int
	num_partitions: int
	clientappio_api_address: str = "0.0.0.0:9094"
	insecure: bool = True
	certificates_path: Optional[str] = None
	extra_args: list[str] = Field(default_factory=list)


class SupernodeManager:
	def __init__(self) -> None:
		self.process: Optional[asyncio.subprocess.Process] = None
		self.stream_tasks: list[asyncio.Task] = []
		self.monitor: Optional[asyncio.Task] = None
		self.log_path: Path = DEFAULT_SUPERNODE_LOG
		self.started_at: Optional[datetime] = None

	async def start_supernode(self, request: SupernodeStartRequest) -> dict[str, str]:
		if self.process:
			raise HTTPException(status_code=400, detail="SuperNode already running")

		project_path = FLOWER_APP_PATH
		if not project_path.exists():
			raise HTTPException(status_code=500, detail="Configured flower-app path not found")

		log_path = self._normalize_log_path(None, DEFAULT_SUPERNODE_LOG)

		cmd = [
			"flower-supernode",
			"--superlink",
			request.superlink_address,
			"--clientappio-api-address",
			request.clientappio_api_address,
			"--node-config",
			f"partition-id={request.partition_id} num-partitions={request.num_partitions}",
			*request.extra_args,
		]
		if request.insecure:
			cmd.append("--insecure")
		elif request.certificates_path:
			cmd.extend(["--root-certificates", request.certificates_path])

		process = await asyncio.create_subprocess_exec(
			*cmd,
			cwd=str(project_path),
			stdout=asyncio.subprocess.PIPE,
			stderr=asyncio.subprocess.PIPE,
			env=self._build_env(),
		)

		if process.stdout is None or process.stderr is None:
			raise HTTPException(status_code=500, detail="Failed to capture process output")

		self.process = process
		self.log_path = log_path
		self.started_at = datetime.utcnow()
		self.stream_tasks = [
			asyncio.create_task(self._stream_to_file(process.stdout, log_path)),
			asyncio.create_task(self._stream_to_file(process.stderr, log_path)),
		]
		self.monitor = asyncio.create_task(self._monitor_process(process, log_path))

		await self._append_line(log_path, f"[{self._timestamp()}] supernode started (pid={process.pid})\n")
		return {
			"status": "running",
			"pid": str(process.pid),
			"log_path": str(log_path),
		}

	async def stop_supernode(self) -> dict[str, str]:
		if not self.process:
			raise HTTPException(status_code=400, detail="SuperNode not running")

		await self._append_line(self.log_path, f"[{self._timestamp()}] supernode stop requested\n")
		await self._terminate_process(self.process)
		await self._finalize_streams(self.stream_tasks)
		if self.monitor:
			await self.monitor
		self.process = None
		self.monitor = None
		self.started_at = None
		return {"status": "stopped"}

	async def _monitor_process(
		self,
		process: asyncio.subprocess.Process,
		log_path: Path,
	) -> None:
		returncode = await process.wait()
		await self._append_line(
			log_path,
			f"[{self._timestamp()}] supernode exited with code {returncode}\n",
		)
		await self._finalize_streams(self.stream_tasks)
		self.process = None
		self.monitor = None
		self.started_at = None

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
		return datetime.utcnow().isoformat()

	@staticmethod
	def _build_env() -> dict[str, str]:
		env = os.environ.copy()
		env.setdefault("PYTHONIOENCODING", "utf-8")
		env.setdefault("LC_ALL", "C.UTF-8")
		env.setdefault("LANG", "C.UTF-8")
		return env


STATE = SupernodeManager()

app = FastAPI(title="Flower Client Server")
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
		"supernode_running": bool(STATE.process),
		"started_at": STATE.started_at.isoformat() if STATE.started_at else None,
		"log_path": str(STATE.log_path),
	}


@app.post("/supernode/start")
async def start_supernode(request: SupernodeStartRequest) -> dict[str, str]:
	return await STATE.start_supernode(request)


@app.post("/supernode/stop")
async def stop_supernode() -> dict[str, str]:
	return await STATE.stop_supernode()


if __name__ == "__main__":
	import uvicorn

	uvicorn.run(app, host="0.0.0.0", port=8001)
