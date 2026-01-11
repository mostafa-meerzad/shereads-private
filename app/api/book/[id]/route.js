import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EditBookSchema } from "@/app/services/bookEditSchema";
import { AddAuthorSchema } from "@/app/services/bookSchema";
import { enforceAdminApi } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;

  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const body = await req.json();

    // Validate incoming fields
    const parsed = EditBookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch current book
    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const previousAuthorId = existing.authorId;

    let authorId = existing.authorId;

    // Handle author changes
    if (data.authorName !== undefined) {
      const finalAuthorName = data.authorName || "Unknown Author";
      let author = await prisma.author.findFirst({
        where: { name: finalAuthorName },
      });

      if (!author) {
        const parseAuthor = AddAuthorSchema.safeParse({
          name: finalAuthorName,
        });
        if (!parseAuthor.success) {
          return NextResponse.json(
            { error: "Invalid author name" },
            { status: 400 }
          );
        }

        author = await prisma.author.create({
          data: { name: finalAuthorName },
        });
      }

      authorId = author.id;
    }

    // Duplicate check (title + author combo)
    if (data.title || data.authorName) {
      const duplicate = await prisma.book.findFirst({
        where: {
          title: data.title ?? existing.title,
          authorId: authorId,
          NOT: { id }, // exclude current book
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "کتابی با همین عنوان توسط این نویسنده موجود است" },
          { status: 409 }
        );
      }
    }

    // Prepare update object
    const updateData = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.publish_date && {
        publish_date: data.publish_date ? new Date(data.publish_date) : null,
      }),
      ...(data.pdfURL !== undefined && { pdfURL: data.pdfURL }),
      ...(data.coverURL !== undefined && { coverURL: data.coverURL }),
      ...(data.Genre !== undefined && { Genre: data.Genre }),
      ...(data.mood !== undefined && { mood: data.mood }),
      ...(data.Motivation !== undefined && { Motivation: data.Motivation }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.Age !== undefined && { Age: data.Age }),
      ...(data.length !== undefined && { length: data.length }),
      authorId,
    };

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData,
      include: { author: true },
    });

    if (previousAuthorId !== authorId) {
      const count = await prisma.book.count({
        where: { authorId: previousAuthorId },
      });

      if (count === 0) {
        await prisma.author.delete({
          where: { id: previousAuthorId },
        });
      }
    }

    return NextResponse.json(updatedBook, { status: 200 });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book, { status: 200 });
  } catch (error) {
    console.error("GET BOOK ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;
  try {
    const awaitedParams = await params;
    const bookId = Number(awaitedParams.id);

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    // Fetch the book and its author
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
      include: { author: true },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const authorId = existingBook.authorId;

    // Count how many books this author has
    const authorBookCount = await prisma.book.count({
      where: { authorId },
    });

    // Delete the book
    await prisma.book.delete({
      where: { id: bookId },
    });

    // If the author has no other books, delete the author too
    if (authorBookCount === 1) {
      await prisma.author.delete({
        where: { id: authorId },
      });
    }

    return NextResponse.json({
      message: "Book deleted successfully",
      authorDeleted: authorBookCount === 1 ? true : false,
    });
  } catch (error) {
    console.error("DELETE BOOK ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
