import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "shelf_life_session";

/**
 * Routing-level session gate.
 *
 * This only checks that a session cookie is *present* — it deliberately does
 * not verify the JWT, because the signing secret lives in the backend and
 * should not be duplicated here. Real enforcement is the 401 that FastAPI
 * returns on every protected endpoint; this middleware exists so signed-out
 * visitors get sent to /login instead of loading an app shell that would then
 * fail every data call.
 *
 * Cookies ignore port, so the cookie the API sets on localhost:8010 is visible
 * to the Next.js server on localhost:3000. If the two are ever deployed to
 * different hosts, the API must set an explicit parent Domain for this to keep
 * working.
 *
 * Deliberately does NOT redirect away from /login or /signup just because a
 * session cookie is present (it used to): a present-but-invalid cookie --
 * expired, signed with an old secret, or pointing at a since-deleted account,
 * all real cases, not hypothetical -- made that redirect fire every time,
 * while the client-side session check on /app correctly detected the invalid
 * session and sent the user right back to /login, an infinite bounce loop
 * that looked to a real user like the app hanging forever. Only the client
 * (useSession, which actually calls /api/auth/me) can tell a valid session
 * from an invalid one, so the "already signed in, skip the auth screen"
 * redirect now lives there instead -- see login-form.tsx / signup-form.tsx.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/app") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve where they were heading so login can return them there.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
