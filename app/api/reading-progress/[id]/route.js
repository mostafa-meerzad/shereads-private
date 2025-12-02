import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";
import { readingProgressSchema } from "@/app/services/readingProgressSchema";

export async function GET(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    const progress = await prisma.reading_Progress.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });

    return NextResponse.json({
      userId: userId,
      progress,
    });
  } catch (error) {
    console.error("GET Reading Progress ERROR:", error);
    return NextResponse.json(
      { error: "Failed to get reading progress", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);
    const body = await req.json();

    const parsed = readingProgressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookId, lastPage } = parsed.data;

     // Fetch the book to check valid page number
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { length: true }
    });

    if (!book) {
      return Response.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    if (lastPage > book.length) {
      return Response.json(
        { error: `Last page (${lastPage}) cannot be greater than total book length (${book.length}).` },
        { status: 400 }
      );
    }

    // Merge progress: update if exists, else create new
    const progress = await prisma.reading_Progress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      create: {
        userId,
        bookId,
        lastPage,
      },
      update: {
        lastPage,
      },
    });

    // Return all reading progress for the user including book info
    const allProgress = await prisma.reading_Progress.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });

    return NextResponse.json({
      userId: userId,
      allProgress,
    });
  } catch (error) {
    console.error("POST Reading Progress ERROR:", error);
    return NextResponse.json(
      { error: "Failed to save reading progress", details: error.message },
      { status: 500 }
    );
  }
}
