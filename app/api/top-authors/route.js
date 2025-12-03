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

    // Fetch author names for each ID
    const authors = await Promise.all(
      grouped.map(async (item) => {
        const author = await prisma.author.findUnique({
          where: { id: item.authorId },
          select: { name: true },
        });

        return {
          authorId: item.authorId,
          authorName: author?.name || "Unknown",
          booksCount: item._count.id,
        };
      })
    );

    return NextResponse.json({ topAuthors: authors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching top authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch top authors" },
      { status: 500 }
    );
  }
}