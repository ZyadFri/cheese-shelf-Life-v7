import type { NextConfig } from "next";

// BACKEND_ORIGIN (server-side only, e.g. "https://1-2-3-4.sslip.io") points
// this proxy at the deployed FastAPI backend. Unset in local dev, where the
// frontend talks to it directly (see NEXT_PUBLIC_API_BASE in src/lib/api.ts).
// Proxying keeps the browser on a single origin in production so the
// httpOnly session cookie is same-origin -- no cross-site cookie handling.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_ORIGIN) return [];
    return [{ source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
