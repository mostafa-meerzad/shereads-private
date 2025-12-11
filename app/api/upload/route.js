import { NextResponse } from "next/server";
import { enforceAdminApi } from "@/lib/adminAuth";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// Heuristic PDF page counter from a Buffer (copied from book route)
function getPdfPageCountFromBuffer(buffer) {
  try {
    const text = buffer.toString("latin1");
    const pageObjects = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
    const countMatches = [...text.matchAll(/\/Count\s+(\d{1,6})/g)].map((m) => parseInt(m[1], 10));
    const maxCount = countMatches.length ? Math.max(...countMatches) : 0;
    const guess = Math.max(pageObjects, maxCount);
    return Number.isFinite(guess) && guess > 0 ? guess : null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  const admin = await enforceAdminApi();
  if (admin instanceof NextResponse) return admin;

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();

    const pdf = form.get("pdf");
    const cover = form.get("cover");
    const title = form.get("title")?.toString() || "book";

    // Build unique, related base name for files
    const baseSafe = (str) =>
      str
        .toString()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\u0600-\u06FF\w-]/g, "")
        .slice(0, 50);

    const baseName = `${baseSafe(title) || "book"}-${Date.now()}`;

    // const publicDir = path.join(process.cwd(), "public");
    const publicDir = path.join(process.cwd(), "uploads");
    const booksDir = path.join(publicDir, "books");
    const coversDir = path.join(publicDir, "covers");
    await fs.mkdir(booksDir, { recursive: true });
    await fs.mkdir(coversDir, { recursive: true });

    const origin = new URL(req.url).origin;

    let finalPdfURL = null;
    let finalCoverURL = null;
    let detectedLength = null;

    if (pdf && typeof pdf === "object" && pdf.arrayBuffer) {
      const pdfOriginalName = pdf.name || "file.pdf";
      const ext = path.extname(pdfOriginalName) || ".pdf";
      const fileName = `${baseName}${ext}`;
      const filePath = path.join(booksDir, fileName);
      const buffer = Buffer.from(await pdf.arrayBuffer());
      detectedLength = getPdfPageCountFromBuffer(buffer);
      await fs.writeFile(filePath, buffer);
      // finalPdfURL = `${origin}/books/${fileName}`;
      finalPdfURL = `/books/${fileName}`;
    }

    if (cover && typeof cover === "object" && cover.arrayBuffer) {
      const coverOriginalName = cover.name || "cover.jpg";
      const ext = path.extname(coverOriginalName) || ".jpg";
      const fileName = `${baseName}${ext}`;
      const filePath = path.join(coversDir, fileName);
      const buffer = Buffer.from(await cover.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      // finalCoverURL = `${origin}/covers/${fileName}`;
      finalCoverURL = `/covers/${fileName}`;
    }

    return NextResponse.json({ pdfPath: finalPdfURL, coverPath: finalCoverURL, length: detectedLength });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
