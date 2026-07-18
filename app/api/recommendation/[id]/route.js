import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { scoreBook } from "@/lib/recommender";
import { verifyApiRequest } from "@/lib/serverAuth";
import { PreferencesSchema } from "@/app/services/preferencesSchema";

// ------------------------------
// GET RECOMMENDATIONS
// ------------------------------
export async function GET(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
  
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract pagination queries
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    // Get book IDs
    const bookIds = Array.isArray(user.recommendedBooksIds)
      ? user.recommendedBooksIds
      : [];

    if (bookIds.length === 0) {
      return NextResponse.json(
        {
          page,
          limit,
          total: 0,
          totalPages: 0,
          books: [],
        },
        { status: 200 }
      );
    }

    // Count total recommended books
    const total = bookIds.length;

    // Get paginated books
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      skip,
      take: limit,
      include: { author: true }, // optional — remove if you don't want
      orderBy: { publish_date: "desc" }, // optional
    });

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        books,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET Recommendation Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ------------------------------
// POST → UPDATE USER PREFS + RECOMMEND
// ------------------------------
export async function POST(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;
  try {
    const awaitedParams = await params;
    const userId = Number(awaitedParams.id);

    if (!userId) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();

    // Validate incoming preferences with Zod
    const parsed = PreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Fetch only the fields needed by scoreBook
    const books = await prisma.book.findMany({
      select: { id: true, mood: true, Motivation: true, authorId: true, length: true, Age: true, categoryId: true },
    });

    // Scoring logic (reusing helper)
    const scoredBooks = books.map((book) => {
      const score = scoreBook(book, data);
      return { id: book.id, score };
    });

    const recommendedIds = scoredBooks
      .filter((b) => b.score >= 10)
      .map((b) => b.id);

    // Update the user with preferences + new recommendations
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        categories: data.categories ?? null,
        mood: data.mood ?? null,
        Motivation: data.Motivation ?? null,
        Age: data.Age ?? null,
        author: data.author ?? null,
        book_length: data.book_length ?? null,
        recommendedBooksIds: recommendedIds.length > 0 ? recommendedIds : null,
      },
    });

    // Filter from in-memory results — no second DB round-trip needed
    const booksFinal = books.filter((b) => recommendedIds.includes(b.id));

    return NextResponse.json(
      {
        recommendedBooks: booksFinal,
        count: booksFinal.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST Recommendation Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
