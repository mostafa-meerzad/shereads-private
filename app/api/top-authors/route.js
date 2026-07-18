import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";

export async function GET() {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;

  try {
    const grouped = await prisma.book.groupBy({
      by: ["authorId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const authorIds = grouped.map((item) => item.authorId);
    const authorRecords = await prisma.author.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    });
    const authorMap = new Map(authorRecords.map((a) => [a.id, a.name]));

    const authors = grouped.map((item) => ({
      authorId: item.authorId,
      authorName: authorMap.get(item.authorId) || "Unknown",
      booksCount: item._count.id,
    }));

    return NextResponse.json({ topAuthors: authors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching top authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch top authors" },
      { status: 500 }
    );
  }
}