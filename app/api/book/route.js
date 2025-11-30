import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/serverAuth";
import { AddBookSchema, AddAuthorSchema } from "@/app/services/bookSchema";
import { enforceAdminApi } from "@/lib/adminAuth";
import fs from "fs/promises";
import path from "path";

// Ensure we run on the Node.js runtime (needed for fs access)
export const runtime = "nodejs";

// Heuristic PDF page counter from a Buffer
function getPdfPageCountFromBuffer(buffer) {
  try {
    const text = buffer.toString("latin1"); // avoid UTF-8 breaking binary
    // Strategy 1: Count occurrences of "/Type /Page" which usually appears per page object
    const pageObjects = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
    // Strategy 2: Look for max /Count N in Pages dictionary
    const countMatches = [...text.matchAll(/\/Count\s+(\d{1,6})/g)].map((m) => parseInt(m[1], 10));
    const maxCount = countMatches.length ? Math.max(...countMatches) : 0;
    const guess = Math.max(pageObjects, maxCount);
    return Number.isFinite(guess) && guess > 0 ? guess : null;
  } catch {
    return null;
  }
}

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
      const form = await req.formData();

      // Helper to parse optional JSON arrays/enums if provided as JSON string
      const parseMaybeJSON = (v) => {
        if (typeof v !== "string") return undefined;
        try {
          return JSON.parse(v);
        } catch {
          return undefined;
        }
      };

      const title = form.get("title")?.toString() || "";
      const description = form.get("description")?.toString() || "";
      const authorName = form.get("authorName")?.toString() || form.get("author")?.toString() || "";
      // const publish_date = form.get("publish_date")?.toString() || null;
      const publish_date = "1813-01-28T00:00:00.000Z";

      console.log("received title: ", title)
      console.log("received description: ", description)
      console.log("received authorName: ", authorName)
      console.log("received publish_date: ", publish_date)
      // Files
      const pdf = form.get("pdf");
      const cover = form.get("cover");

      // Build unique, related base name for files
      let pdfURL = null;
      let coverURL = null;

      const baseSafe = (str) =>
        str
          .toString()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\u0600-\u06FF\w-]/g, "") // allow Persian letters and word chars
          .slice(0, 50);

      const baseName = `${baseSafe(title) || "book"}-${Date.now()}`;

      // Ensure directories
      const publicDir = path.join(process.cwd(), "public");
      const booksDir = path.join(publicDir, "books");
      const coversDir = path.join(publicDir, "covers");
      await fs.mkdir(booksDir, { recursive: true });
      await fs.mkdir(coversDir, { recursive: true });

      // Derive origin so we can return absolute URLs (Zod expects url format)
      const origin = new URL(req.url).origin;

      // Save PDF if provided
      let detectedLength = null;
      if (pdf && typeof pdf === "object" && pdf.arrayBuffer) {
        const original = pdf.name || "file.pdf";
        const ext = path.extname(original) || ".pdf";
        const fileName = `${baseName}${ext}`;
        const filePath = path.join(booksDir, fileName);
        const buffer = Buffer.from(await pdf.arrayBuffer());
        // Detect pages before writing (buffer in memory)
        detectedLength = getPdfPageCountFromBuffer(buffer);
        await fs.writeFile(filePath, buffer);
        pdfURL = `${origin}/books/${fileName}`;
      }

      // Save cover if provided
      if (cover && typeof cover === "object" && cover.arrayBuffer) {
        const original = cover.name || "cover.jpg";
        const ext = path.extname(original) || ".jpg";
        const fileName = `${baseName}${ext}`;
        const filePath = path.join(coversDir, fileName);
        const buffer = Buffer.from(await cover.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        coverURL = `${origin}/covers/${fileName}`;
      }

      payload = {
        title,
        description,
        authorName,
        // publish_date: publish_date || null,
        publish_date:"1813-01-28T00:00:00.000Z",
        pdfURL,
        coverURL,
        Genre: parseMaybeJSON(form.get("Genre")) ?? undefined,
        mood: parseMaybeJSON(form.get("mood")) ?? undefined,
        Motivation: parseMaybeJSON(form.get("Motivation")) ?? undefined,
        Age: form.get("Age")?.toString() ?? undefined,
        // If client sent length keep it for compatibility, but prefer detectedLength when available
        length: detectedLength ?? (form.get("length") ? Number(form.get("length")) : undefined),
      };
    } else {
      // Fallback to JSON body
      const body = await req.json();
      payload = body;
    }

    // Validate book input
    const parsedBook = AddBookSchema.safeParse(payload);

    console.log("parsed book: ", parsedBook)
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

