"""
SQLite persistence for user accounts. This is the only stateful storage in the
project -- model artifacts stay on disk as files and are never written here.

The LIVE database file is always on genuinely local disk (a temp directory),
never on STORAGE_DIR directly. In production STORAGE_DIR is an Azure Files
(SMB) mount, and SQLite's locking protocol is documented by the SQLite
project itself as unreliable over network filesystems -- confirmed the hard
way here: every attempt to open a database on that share failed instantly
with "database is locked", even with zero other processes holding it
(Azure's own handle listing showed none). Durability across restarts and
redeploys instead comes from a plain whole-file backup/restore against
STORAGE_DIR: a straight byte copy, not a SQLite connection, so it doesn't
touch SQLite's locking protocol at all and works fine on Azure Files.
  - on import, the local file is restored from the last backup, if one
    exists and isn't empty
  - after every committed write, the local file is backed up again

Avatars and the session-signing secret (backend/auth/security.py) stay
directly on STORAGE_DIR -- plain file reads/writes with no locking protocol
involved, unaffected by any of this.
"""
from __future__ import annotations

import logging
import os
import shutil
import tempfile
import threading
import time
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger("shelf_life.db")

BACKEND_DIR = Path(__file__).resolve().parent
STORAGE_DIR = Path(os.environ.get("STORAGE_DIR", BACKEND_DIR / "storage"))
AVATAR_DIR = STORAGE_DIR / "avatars"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

# The durable copy: wherever STORAGE_DIR resolves to (Azure Files in
# production, a local ./storage folder in dev).
BACKUP_DB_PATH = STORAGE_DIR / "shelf_life.db"

# The live copy SQLite actually opens: always genuinely local, regardless of
# what STORAGE_DIR is, so SQLite's own file locking always works correctly.
LOCAL_DB_DIR = Path(os.environ.get("LOCAL_DB_DIR", Path(tempfile.gettempdir()) / "shelf_life_local"))
LOCAL_DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = LOCAL_DB_DIR / "shelf_life.db"

_backup_lock = threading.Lock()


def _restore_from_backup() -> None:
    """Copies the last backup onto the local path before the engine ever
    opens it, so a fresh container picks up existing accounts instead of
    starting empty. Skips a zero-byte backup (e.g. one left over from a
    previously failed write) rather than overwriting a fresh local file
    with nothing."""
    if DB_PATH.exists():
        return
    if BACKUP_DB_PATH.exists() and BACKUP_DB_PATH.stat().st_size > 0:
        shutil.copy2(BACKUP_DB_PATH, DB_PATH)
        logger.info("db: restored local database from backup (%d bytes)", BACKUP_DB_PATH.stat().st_size)


def _backup_to_storage() -> None:
    """Copies the current local database onto STORAGE_DIR. Called after
    every commit (see the event listener below), not on a timer, so the
    durable copy is never more than one transaction behind -- writes here
    are rare enough (signup, password change, avatar update) that a
    whole-file copy per commit costs nothing noticeable."""
    with _backup_lock:
        try:
            shutil.copy2(DB_PATH, BACKUP_DB_PATH)
        except OSError:
            logger.exception("db: backup to persistent storage failed")


_restore_from_backup()

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

# check_same_thread=False is required because FastAPI serves requests from a
# thread pool; each request still gets its own Session via get_db().
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(Session, "after_commit")
    def _backup_after_commit(_session: Session) -> None:
        _backup_to_storage()


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one Session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(*, retries: int = 3, delay_sec: float = 2.0) -> None:
    """Creates any missing tables (a no-op once the schema already exists).
    The retry loop is now just a safety margin on local disk -- the actual
    fix for the Azure Files locking failure is DB_PATH being local at all,
    per the module docstring above."""
    from backend.auth import models  # noqa: F401 -- registers tables on Base

    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            _backup_to_storage()
            return
        except OperationalError as exc:
            if "database is locked" not in str(exc).lower() or attempt == retries:
                raise
            logger.warning("init_db: database locked (attempt %d/%d), retrying in %.0fs", attempt, retries, delay_sec)
            time.sleep(delay_sec)
