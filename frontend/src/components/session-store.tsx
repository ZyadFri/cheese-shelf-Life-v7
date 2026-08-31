"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api, type AuthUser } from "@/lib/api";
import { isSessionIdle, startActivityTracking } from "@/lib/session-activity";

interface SessionValue {
  user: AuthUser | null;
  /** True until the initial /api/auth/me call resolves. Gate protected UI on
   *  this so a signed-in user never sees a flash of the signed-out state. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Replace the cached user after a profile/avatar mutation. */
  setUser: (user: AuthUser) => void;
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<SessionValue | null>(null);

/** Bounds how long the initial sign-in check can leave the app on its
 * loading screen. Without this, anything that makes /api/auth/me hang or
 * never settle (a stale cookie the server takes an unusual path on, a
 * transient network condition, anything not yet anticipated) strands an
 * ordinary user on a spinner with no way to know a hard refresh would fix
 * it. Past this deadline the app proceeds as signed-out -- exactly what a
 * real "not logged in" response would have produced anyway. */
const AUTH_CHECK_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/** Recovers automatically from a browser tab that loaded this app's HTML
 * before a newer deploy replaced the JS chunk files it references (a stale
 * cache, a tab left open across a deploy) -- Next.js's client runtime
 * throws a recognizable error when a chunk 404s instead of silently
 * hanging, so a full reload here fetches the current deployment instead of
 * leaving the user stuck on a shell that can never finish loading. Runs
 * once at the app root, independent of any auth/session state. */
function useChunkLoadRecovery() {
  React.useEffect(() => {
    function isChunkLoadError(reason: unknown): boolean {
      const message = reason instanceof Error ? `${reason.name} ${reason.message}` : String(reason);
      return /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module/i.test(message);
    }

    function handle(event: ErrorEvent | PromiseRejectionEvent) {
      const reason = "reason" in event ? event.reason : event.error;
      if (isChunkLoadError(reason)) {
        window.location.reload();
      }
    }

    window.addEventListener("error", handle);
    window.addEventListener("unhandledrejection", handle);
    return () => {
      window.removeEventListener("error", handle);
      window.removeEventListener("unhandledrejection", handle);
    };
  }, []);
}

/**
 * Holds the signed-in user for the whole app. The session itself is an
 * httpOnly cookie owned by the backend — this only caches the identity the
 * server reports, so signing out server-side is always authoritative.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  useChunkLoadRecovery();

  const refresh = React.useCallback(async () => {
    try {
      setUserState(await api.me());
    } catch {
      setUserState(null);
    }
  }, []);

  // Best-effort: tell the server to drop the cookie too, but the frontend
  // state is cleared either way -- a network hiccup here must never leave
  // the UI stuck showing a "signed in" state the idle policy just rejected.
  const clearSession = React.useCallback(async (reason?: "idle") => {
    try {
      await api.logout();
    } catch {
      // ignore -- clearing local state below is what actually matters here
    } finally {
      setUserState(null);
    }
    if (reason === "idle") {
      toast.info("You were signed out after a period of inactivity.");
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    async function hydrate() {
      // A tab/profile idle longer than the policy is treated as signed out
      // without even asking the server -- this is what makes "return after
      // a long time away" require login again, while a normal refresh
      // (which doesn't imply idle time has passed) hydrates normally below.
      if (isSessionIdle()) {
        await withTimeout(clearSession("idle"), AUTH_CHECK_TIMEOUT_MS).catch(() => {
          if (active) setUserState(null);
        });
      } else {
        try {
          const u = await withTimeout(api.me(), AUTH_CHECK_TIMEOUT_MS);
          if (active) setUserState(u);
        } catch {
          if (active) setUserState(null);
        }
      }
      if (active) setLoading(false);
    }

    hydrate();
    const stopTracking = startActivityTracking(() => {
      // Fires while the app is open and inactivity crosses the limit.
      void clearSession("idle");
    });

    return () => {
      active = false;
      stopTracking();
    };
  }, [clearSession]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    setUserState(await api.login({ email, password }));
  }, []);

  const signUp = React.useCallback(async (name: string, email: string, password: string) => {
    setUserState(await api.signup({ name, email, password }));
  }, []);

  const signOut = React.useCallback(async () => {
    await clearSession();
    router.push("/");
    router.refresh();
  }, [clearSession, router]);

  const value = React.useMemo<SessionValue>(
    () => ({ user, loading, signIn, signUp, signOut, setUser: setUserState, refresh }),
    [user, loading, signIn, signUp, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

// Re-exported for existing callers -- the real (plain, server-safe)
// implementation now lives in @/lib/utils so server components (e.g. the
// landing page) can use it without importing a "use client" module.
export { initialsOf } from "@/lib/utils";
