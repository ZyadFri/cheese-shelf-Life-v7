"""
SQLite persistence for user accounts. This is the only stateful storage in the
project -- model artifacts stay on disk as files and are never written here.

The database file lives at backend/storage/shelf_life.db and is created on
first import. Nothing in the prediction/modeling path touches this module.
"""
from __future__ import annotations

import logging
import os
import time
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger("shelf_life.db")

BACKEND_DIR = Path(__file__).resolve().parent
STORAGE_DIR = Path(os.environ.get("STORAGE_DIR", BACKEND_DIR / "storage"))
AVATAR_DIR = STORAGE_DIR / "avatars"
DB_PATH = STORAGE_DIR / "shelf_life.db"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

# check_same_thread=False is required because FastAPI serves requests from a
# thread pool; each request still gets its own Session via get_db().
#
# timeout=30 sets SQLite's busy-wait (Python's sqlite3 turns this into
# PRAGMA busy_timeout): the storage volume is Azure Files (SMB), and a
# rolling deploy briefly runs the old and new revisions side by side, both
# opening this same file. SQLite's default busy_timeout is 0 -- it raises
# "database is locked" instantly instead of waiting the moment either
# revision touches the file while the other holds it. 30s comfortably
# outlasts that overlap window without masking a genuinely stuck lock.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one Session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(*, retries: int = 5, delay_sec: float = 4.0) -> None:
    """Creates any missing tables (a no-op once the schema already exists).
    Retries on "database is locked" -- belt-and-braces alongside the
    busy_timeout above for the same rolling-deploy overlap, in case a
    single connection attempt still lands mid-DDL from the other
    revision."""
    from backend.auth import models  # noqa: F401 -- registers tables on Base

    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as exc:
            if "database is locked" not in str(exc).lower() or attempt == retries:
                raise
            logger.warning("init_db: database locked (attempt %d/%d), retrying in %.0fs", attempt, retries, delay_sec)
            time.sleep(delay_sec)
