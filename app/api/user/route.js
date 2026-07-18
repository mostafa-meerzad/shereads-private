import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceAdminApi } from "@/lib/adminAuth";

export async function GET(req) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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