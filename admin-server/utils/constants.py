from __future__ import annotations

from pathlib import Path
import re

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FLOWER_APP_PATH = BASE_DIR / "flower-app"
LOG_DIR = Path("logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SUPERLINK_LOG = LOG_DIR / "superlink.log"
DEFAULT_RUN_LOG = LOG_DIR / "run.log"
DATASETS_DIR = FLOWER_APP_PATH / "datasets"
DATASETS_DIR.mkdir(parents=True, exist_ok=True)
ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")

__all__ = [
    "ANSI_ESCAPE_RE",
    "BASE_DIR",
    "DEFAULT_RUN_LOG",
    "DEFAULT_SUPERLINK_LOG",
    "FLOWER_APP_PATH",
    "DATASETS_DIR",
    "LOG_DIR",
]
