import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { redirect } from "next/navigation";

// Read token from cookies and verify JWT. Returns payload or null.
export async function getUserFromCookie() {
    const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  return payload || null;
}

// For server components: require authentication or redirect to /login
export function requireUser() {
  const user = getUserFromCookie();
  if (!user) redirect("/login");
  return user;
}

// For API route handlers: verify and return payload or null
export async function verifyApiRequest() {
    const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
