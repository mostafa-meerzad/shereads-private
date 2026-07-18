import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

export function resolveBookPdfPath(pdfURL) {
  const relative = pdfURL.replace(/^https?:\/\/[^/]+/, "");
  const uploadsPath = path.join(process.cwd(), "uploads", relative);
  const publicPath = path.join(process.cwd(), "public", relative);
  if (existsSync(uploadsPath)) return uploadsPath;
  if (existsSync(publicPath)) return publicPath;
  return null;
}

export function pagesExist(bookId) {
  const page1 = path.join(
    process.cwd(),
    "uploads",
    "books",
    String(bookId),
    "pages",
    "page-001.webp"
  );
  return existsSync(page1);
}

export function isConverting(bookId) {
  const lock = path.join(
    process.cwd(),
    "uploads",
    "books",
    String(bookId),
    "pages",
    ".converting"
  );
  return existsSync(lock);
}

export async function convertPdfToImages(bookId, pdfURL) {
  const pdfPath = resolveBookPdfPath(pdfURL);
  if (!pdfPath) throw new Error(`PDF not found for book ${bookId}: ${pdfURL}`);

  const pagesDir = path.join(
    process.cwd(),
    "uploads",
    "books",
    String(bookId),
    "pages"
  );
  const tmpDir = path.join(pagesDir, "_tmp");
  const lockFile = path.join(pagesDir, ".converting");

  await fs.mkdir(tmpDir, { recursive: true });
  await fs.writeFile(lockFile, "1");

  try {
    // Convert PDF pages to PNG at 150 DPI
    await execFileAsync("pdftoppm", ["-r", "150", "-png", pdfPath, path.join(tmpDir, "page")]);

    const pngFiles = (await fs.readdir(tmpDir))
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (pngFiles.length === 0) throw new Error("pdftoppm produced no pages");

    // Convert each PNG → WebP
    for (let i = 0; i < pngFiles.length; i++) {
      const src = path.join(tmpDir, pngFiles[i]);
      const dest = path.join(
        pagesDir,
        `page-${String(i + 1).padStart(3, "0")}.webp`
      );
      await sharp(src).webp({ quality: 85 }).toFile(dest);
    }

    return pngFiles.length;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await fs.rm(lockFile, { force: true });
  }
}
