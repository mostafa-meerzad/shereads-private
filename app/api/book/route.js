import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";
import { AddBookSchema, AddAuthorSchema } from "@/app/services/bookSchema";
import { enforceAdminApi } from "@/lib/adminAuth";
import fs from "fs/promises";
import path from "path";

// Ensure we run on the Node.js runtime (needed for fs access)
export const runtime = "nodejs";

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

export async function POST(req) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload;

    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Use /api/upload to upload files (multipart). Send JSON to /api/book for DB creation." },
        { status: 400 }
      );
    }

    // Fallback to JSON body
    const body = await req.json();
    payload = body;

    // Validate book input
    const parsedBook = AddBookSchema.safeParse(payload);


    if (!parsedBook.success) {
      return NextResponse.json(
        {
          error: "Invalid book input",
          details: parsedBook.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedBook.data;

    // 1️⃣ Check if author already exists
    let author = await prisma.author.findFirst({
      where: { name: data.authorName },
    });

    // 2️⃣ If not → create author
    if (!author) {
      const authorCheck = AddAuthorSchema.safeParse({ name: data.authorName });

      if (!authorCheck.success) {
        return NextResponse.json(
          { error: "Invalid author name" },
          { status: 400 }
        );
      }

      author = await prisma.author.create({
        data: { name: data.authorName },
      });
    }

    // Author ID ready to use
    const authorId = author.id;

    // 3️⃣ Duplicate check: Same title + author
    const existingBook = await prisma.book.findFirst({
      where: {
        title: data.title,
        authorId: authorId,
      },
    });

    if (existingBook) {
      return NextResponse.json(
        { error: "این کتاب قبلاً توسط این نویسنده ثبت شده است" },
        { status: 409 }
      );
    }

    // 4️⃣ Create the book
    const newBook = await prisma.book.create({
      data: {
        title: data.title,
        description: data.description,
        authorId,
        publish_date: data.publish_date ? new Date(data.publish_date) : null,
        pdfURL: data.pdfURL,
        coverURL: data.coverURL,
        Genre: data.Genre,
        mood: data.mood,
        Motivation: data.Motivation,
        Age: data.Age,
        length: data.length,
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}

