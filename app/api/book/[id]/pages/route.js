import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyApiRequest } from "@/lib/serverAuth";
import {
  pagesExist,
  isConverting,
  convertPdfToImages,
} from "@/lib/convertPdfToImages";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const auth = await verifyApiRequest();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const bookId = Number(id);
  if (!bookId) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { pdfURL: true, length: true },
  });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ready = pagesExist(bookId);

  // Lazy conversion for existing books: trigger if pages missing and not already running
  if (!ready && book.pdfURL && !isConverting(bookId)) {
    convertPdfToImages(bookId, book.pdfURL)
      .then((numPages) =>
        prisma.book.update({ where: { id: bookId }, data: { length: numPages } })
      )
      .catch((err) => console.error(`[PDF Conversion] Book ${bookId}:`, err));
  }

  return NextResponse.json({ numPages: book.length, pagesReady: ready });
}
