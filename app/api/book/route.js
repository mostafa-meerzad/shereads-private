import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";

export async function GET(req) {
  verifyApiRequest();
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;
    const genre = url.searchParams.get("genre");
    const author = url.searchParams.get("author");
    // const date = url.searchParams.get("date");
    const title = url.searchParams.get("title");

    const skip = (page - 1) * limit;

    // Build Prisma where filter dynamically
    const where = {};

    if (genre) {
      // genre is stored as JSON array
      where.Genre = { array_contains: [genre] };
    }

    if (author) {
      where.author = {
        is: { name: { contains: author } },
      };
    }

    // if (date) {
    //   const year = parseInt(date);
    //   if (!isNaN(year)) {
    //     where.publish_date = {
    //       gte: new Date(year, 0, 1),
    //       lt: new Date(year + 1, 0, 1),
    //     };
    //   }
    // }

    if (title) {
      where.title = { contains: title };
    }

    const total = await prisma.book.count({ where });

    const books = await prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publish_date: "desc" },
      include: { author: true },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books,
    });
  } catch (err) {
    console.error("GET Books Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
