import fs from "fs";
import path from "path";
import mime from "mime";

export async function GET(request, { params }) {
  try {
    const paramsObj = await params;
    const filenameParts = paramsObj.path; // ["books", "file.pdf"] OR ["covers", "image.png"]

    // Build the file path in uploads folder
    const filePath = path.join(process.cwd(), "uploads", ...filenameParts);

    if (!fs.existsSync(filePath)) {
      return new Response("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const type = mime.getType(filePath) || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Length": fileBuffer.length,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal server error", { status: 500 });
  }
}
