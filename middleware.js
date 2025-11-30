import { NextResponse } from "next/server";

/**
 * Middleware to restrict access for unauthenticated users.
 * - If no `token` cookie is present, only allow access to:
 *   `/login`, `/register`, `/dashboard`, `/api/login`, `/api/register`, and next static assets.
 * - All other requests will be redirected to `/login`.
 *
 * Note: This middleware only checks for cookie presence (not JWT signature) to keep it Edge-compatible.
 * If you need full JWT verification here, validate on the server (API) side or use a Node middleware.
 */

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow any direct static file requests (public/*) EXCEPT protected folders
  // Protect only book and cover files under `/books` and `/covers`.
  // e.g. allow `/test-img.png`, `/images/logo.svg`, etc.
  const isProtectedAssetFolder = pathname.startsWith("/books") || pathname.startsWith("/covers");
  const looksLikeFile = /\.[a-z0-9]+$/i.test(pathname);
  if (looksLikeFile && !isProtectedAssetFolder) {
    return NextResponse.next();
  }

  // Publicly allowed paths for unauthenticated users
  const publicPaths = new Set([
    "/login",
    "/",
    "/welcome",
    "/register",
    "/dashboard",
    "/api/login",
    "/api/register",
  ]);

  // Allow public paths and onboarding routes
  if (
    publicPaths.has(pathname) ||
    pathname.startsWith("/api/public") ||
    pathname === "/onboarding" ||
    pathname.startsWith("/onboarding/")
  ) {
    return NextResponse.next();
  }

  // Read token cookie (Edge-compatible)
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Token present — allow. (Server-side routes should verify JWT for security.)
  return NextResponse.next();
}

export const config = {
  // Run middleware for all routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
