import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    // Extract pagination from query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    // Count total favorites for pagination
    const total = await prisma.favorite.count({
      where: { userId },
    });

    // Fetch paginated favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { book: {
      include: {
        author: true,   // <-- include author here
      }}},
      skip,
      take: limit,
      orderBy: { id: "desc" }, // optional: newest favorites first
    });

    const favoriteBooks = favorites.map((f) => f.book);

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        favorites: favoriteBooks,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET Favorites Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();
    const bookId = Number(body.bookId);

    if (!bookId) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    // Create favorite (ignore duplicate with upsert)
    await prisma.favorite.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: {}, // do nothing if exists
      create: { userId, bookId },
    });

    // Fetch all favorites again
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { book: {
      include: {
        author: true,   // <-- include author here
      }}},
    });

    const favoriteBooks = favorites.map((f) => f.book);

    return NextResponse.json({ favorites: favoriteBooks }, { status: 201 });
  } catch (err) {
    console.error("POST Favorites Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();
    const bookId = Number(body.bookId);

    if (!bookId) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: { userId, bookId },
    });

    // Return updated list
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { book: {
      include: {
        author: true,   // <-- include author here
      }}},
    });

    const favoriteBooks = favorites.map((f) => f.book);

    return NextResponse.json({ favorites: favoriteBooks }, { status: 200 });
  } catch (err) {
    console.error("DELETE Favorites Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
