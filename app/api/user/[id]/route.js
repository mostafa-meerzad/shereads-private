import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyApiRequest } from "@/lib/serverAuth";

export async function GET(req, { params }) {
    verifyApiRequest();
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          include: { book: true },
        },
        readingProgress: {
          include: { book: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude passwordHash
    const { passwordHash, ...userSafe } = user;

    return NextResponse.json({ user: userSafe }, { status: 200 });
  } catch (err) {
    console.error("GET User Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


