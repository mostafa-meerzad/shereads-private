import fs from "fs";
import path from "path";
import mime from "mime";

export async function GET(request, { params }) {
  try {
    const paramsObj = await params;
    const filenameParts = paramsObj.path; // ["books", "file.pdf"] OR ["covers", "image.png"]

    // Build the file path in uploads folder
    // The paramsObj.path is an array like ["books", "file.pdf"]
    const filePath = path.join(process.cwd(), "uploads", ...filenameParts);

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const type = mime.getType(filePath) || "application/octet-stream";
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": fileBuffer.length,
        },
      });
    }

    // Try public folder as fallback
    const publicPath = path.join(process.cwd(), "public", ...filenameParts);
    if (fs.existsSync(publicPath)) {
      const fileBuffer = fs.readFileSync(publicPath);
      const type = mime.getType(publicPath) || "application/octet-stream";
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": type,
          "Content-Length": fileBuffer.length,
        },
      });
    }

    return new Response("File not found", { status: 404 });
  } catch (err) {
    console.error(err);
    return new Response("Internal server error", { status: 500 });
  }
}
