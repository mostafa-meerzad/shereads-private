import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/app/services/registerSchema";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { scoreBook } from "@/lib/recommender";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    //recomendation logic
    let recommendedIds = [];

    const hasPreferences =
      data.Genre ||
      data.mood ||
      data.Motivation ||
      data.Age ||
      data.categories ||
      data.author ||
      data.book_length;

    if (hasPreferences) {
      const books = await prisma.book.findMany();

      const scoredBooks = books.map((book) => {
        const score = scoreBook(book, data);
        return { id: book.id, score };
      });

      recommendedIds = scoredBooks
        .filter((b) => b.score >= 10)
        .map((b) => b.id);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        gender: data.gender,
        email: data.email,
        passwordHash,
        role: data.role,
        Genre: data.Genre ?? null,
        mood: data.mood ?? null,
        Motivation: data.Motivation ?? null,
        Age: data.Age ?? null,
        author: data.author ?? null,
        book_length: data.book_length ?? null,
        recommendedBooksIds: recommendedIds.length > 0 ? recommendedIds : null,
        categories: data.categories ?? null,
      },
    });

    // Create token
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();

    //Set token in HTTP-only cookie
    cookieStore.set({
      name: "token",
      value: token,
      path: "/",
      httpOnly: true,
      // Only set Secure in production so cookies work in local dev (http).
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days, should match JWT_EXPIRES_IN
    });

    // Remove passwordHash
    const { passwordHash: _, ...userSafe } = user;

    return NextResponse.json(
      {
        user: userSafe,
        token,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
