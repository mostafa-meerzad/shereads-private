import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";

export async function GET(req) {
    verifyApiRequest();
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const name = searchParams.get("name"); 

    const where = {};

    if (name) {
      where.name = { contains: name }; 
    }

    // Total authors count
    const total = await prisma.author.count({ where });

    // Fetch authors
    const authors = await prisma.author.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        books: true, 
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: authors,
    });

  } catch (error) {
    console.error("GET Authors Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch authors", details: error.message },
      { status: 500 }
    );
  }
}
