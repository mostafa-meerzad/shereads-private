import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import prisma from "./prisma";

// Read token from cookies and verify JWT. Returns payload or null.
export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.sub) return null;

  // Fetch fresh user record to check isActive and latest data
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) return null;

  return user;
}

// For server components: require authentication or redirect to /login
export async function requireUser() {
  const user = await getUserFromCookie();
  if (!user || user.isActive === false || user.isActive === 0) redirect("/login");
  return user;
}

// For API route handlers: verify and return payload or null
export async function verifyApiRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
  if (user.isActive === false || user.isActive === 0) {
    return NextResponse.json({ error: "User is deactivated" }, { status: 403 });
  }

  // Return the user object for callers that need it
  return user;
}
