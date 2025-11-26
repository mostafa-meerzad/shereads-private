import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceAdminApi } from "@/lib/adminAuth";

export async function GET() {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;

  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    // Count total users
    const total = await prisma.user.count();

    return NextResponse.json({
      total,
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}