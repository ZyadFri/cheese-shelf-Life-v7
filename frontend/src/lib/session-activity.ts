"use client";

/**
 * Frontend-only inactivity policy. This is a UX mechanism, not
 * authentication -- the real session is the httpOnly cookie the backend
 * issues and validates on every request. This module only decides when a
 * long-idle tab should stop trusting its cached "signed in" state and ask
 * the user to sign in again, via the existing /api/auth/logout +
 * /api/auth/me endpoints (see session-store.tsx). Nothing here stores a
 * token; the localStorage value is just a last-activity timestamp.
 *
 * Deliberately NOT using beforeunload/pagehide: those fire on a normal
 * refresh too, which would make "refresh" indistinguishable from "closed
 * the tab" and log an actively-browsing user out. Idle time is measured by
 * comparing "now" against a periodically-refreshed timestamp instead.
 */

/** How long the app can go without meaningful activity before the frontend
 * treats the session as stale and signs the user out. One place to tune. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const STORAGE_KEY = "shelf_life_last_activity";
const WRITE_THROTTLE_MS = 30 * 1000; // avoid a localStorage write on every keystroke/pointer move
const CHECK_INTERVAL_MS = 60 * 1000; // how often the running app re-checks elapsed idle time

let lastWrite = 0;

function recordActivity(): void {
  const now = Date.now();
  if (now - lastWrite < WRITE_THROTTLE_MS) return;
  lastWrite = now;
  try {
    localStorage.setItem(STORAGE_KEY, String(now));
  } catch {
    // Storage unavailable (private browsing, disabled storage, etc.) --
    // inactivity tracking simply can't run; the backend's own cookie/JWT
    // expiry remains the real authority regardless.
  }
}

function msSinceLastActivity(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const last = Number(raw);
    return Number.isFinite(last) ? Date.now() - last : null;
  } catch {
    return null;
  }
}

/** True only when a prior activity timestamp exists AND it's older than the
 * idle limit. A browser/profile with no recorded activity yet (e.g. never
 * tracked before) is treated as "not idle" -- there is nothing to time out
 * against, so this never forces an unnecessary logout on first load. */
export function isSessionIdle(): boolean {
  const elapsed = msSinceLastActivity();
  return elapsed !== null && elapsed > IDLE_TIMEOUT_MS;
}

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "touchstart", "focus"] as const;

/** Begins listening for meaningful user activity (pointer, keyboard, touch,
 * window focus) and refreshing the stored timestamp, throttled so it never
 * writes on every event. Also starts a periodic idle check that calls
 * `onIdle` once elapsed idle time crosses IDLE_TIMEOUT_MS. Returns a cleanup
 * function; call once for the lifetime of the authenticated app. */
export function startActivityTracking(onIdle: () => void): () => void {
  recordActivity(); // seed a fresh timestamp (e.g. right after a successful login)

  const handleActivity = () => recordActivity();
  for (const evt of ACTIVITY_EVENTS) {
    window.addEventListener(evt, handleActivity, { passive: true, capture: evt === "focus" });
  }

  const interval = window.setInterval(() => {
    if (isSessionIdle()) onIdle();
  }, CHECK_INTERVAL_MS);

  return () => {
    for (const evt of ACTIVITY_EVENTS) {
      window.removeEventListener(evt, handleActivity, { capture: evt === "focus" } as EventListenerOptions);
    }
    window.clearInterval(interval);
  };
}
