from __future__ import annotations

import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FLOWER_APP_PATH = BASE_DIR / "flower-app"
LOG_DIR = Path("logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_SUPERNODE_LOG = LOG_DIR / "supernode.log"
ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")

__all__ = [
    "ANSI_ESCAPE_RE",
    "BASE_DIR",
    "DEFAULT_SUPERNODE_LOG",
    "FLOWER_APP_PATH",
    "LOG_DIR",
]
