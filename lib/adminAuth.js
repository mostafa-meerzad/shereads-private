import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import prisma from "./prisma";

/**
 * Read JWT from cookie, verify it and ensure the role is 'admin'.
 * Returns the token payload when valid and admin, otherwise null.
 */
export async function getAdminFromCookie() {
  const awaitedCookie = await cookies();
  const token = awaitedCookie.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  // Fetch user and ensure active + admin role
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) return null;
  if (user.isActive === false || user.isActive === 0) return null;
  return user.role === "admin" ? payload : null;
}

/**
 * Server-side pages: require admin and redirect to `/login` if not.
 * Use this at the top of server components / pages.
 * Example: import { requireAdmin } from '@/lib/adminAuth'; requireAdmin();
 */
export async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/login");
  return admin;
}

/**
 * API helpers for app-route handlers.
 * - `verifyAdminApiRequest()` returns the payload when admin, otherwise null.
 * - `enforceAdminApi()` returns a `NextResponse` 403 when unauthorized, otherwise returns the payload.
 *
 * Example usage in an app route:
 * const denied = enforceAdminApi(); if (denied) return denied; // now `denied` is a NextResponse when unauthorized
 */
export async function verifyAdminApiRequest() {
  const awaitedCookie = await cookies();
  const token = awaitedCookie.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) return null;
  if (user.isActive === false || user.isActive === 0) return null;
  return user.role === "admin" ? payload : null;
}

export async function enforceAdminApi() {
  const admin = await verifyAdminApiRequest();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return admin;
}
