import { RegisterSchema } from "@/app/services/registerSchema";
import { hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        { error: "این ایمیل قبلاً استفاده شده است" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    //recomendation logic
    let recommendedIds = [];

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        gender: data.gender,
        email: data.email,
        passwordHash,
        role: data.role,
        mood: data.mood ?? null,
        Motivation: data.Motivation ?? null,
        Age: data.Age ?? null,
        author: data.author ?? null,
        book_length: data.book_length ?? null,
        recommendedBooksIds: recommendedIds.length > 0 ? recommendedIds : null,
        categories: data.categories ?? null,
      },
    });

    // Remove passwordHash
    const { passwordHash: _, ...userSafe } = user;

    return NextResponse.json(
      {
        user: userSafe,
        
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
409