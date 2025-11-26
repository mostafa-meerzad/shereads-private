import { NextResponse } from "next/server";
import { enforceAdminApi } from "@/lib/adminAuth";

export async function GET(req) {
  // enforceAdminApi() returns the payload when the request is from an admin,
  // or a NextResponse (403) when unauthorized.
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin; // returns 403

  // Example admin-only response — replace with real logic
  const sampleStats = {
    usersCount: 42,
    activeSessions: 7,
    recentSignups: 3,
  };

  return NextResponse.json({ ok: true, stats: sampleStats, admin });
}
