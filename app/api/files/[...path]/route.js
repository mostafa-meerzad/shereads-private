import fs from "fs";
import path from "path";
import mime from "mime";

export async function GET(request, { params }) {
  try {
    const paramsObj = await params;
    const filenameParts = paramsObj.path;

    const uploadsBase = path.resolve(process.cwd(), "uploads");
    const publicBase = path.resolve(process.cwd(), "public");

    let filePath = path.resolve(uploadsBase, ...filenameParts);
    if (!filePath.startsWith(uploadsBase + path.sep) && filePath !== uploadsBase) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(publicBase, ...filenameParts);
      if (!filePath.startsWith(publicBase + path.sep) && filePath !== publicBase) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    if (!fs.existsSync(filePath)) {
      return new Response("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");
    const type = mime.getType(filePath) || "application/octet-stream";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      return new Response(fileStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": type,
        },
      });
    } else {
      const fileStream = fs.createReadStream(filePath);
      return new Response(fileStream, {
        status: 200,
        headers: {
          "Content-Length": fileSize,
          "Content-Type": type,
          "Accept-Ranges": "bytes",
        },
      });
    }
  } catch (err) {
    console.error(err);
    return new Response("Internal server error", { status: 500 });
  }
}
