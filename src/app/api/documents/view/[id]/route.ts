// src/app/api/documents/view/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";
import mime from "mime-types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = params;

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        // Security check: user can only access their own files.
        // For shared projects, you might adjust this logic later.
        userId: session.user.id,
      },
    });

    if (!document) {
      return new NextResponse("File not found or access denied", {
        status: 404,
      });
    }

    // ✅ --- FIX: Path construction logic updated for consistency ---

    // 1. Define the base upload directory. This now perfectly matches the logic
    //    in your POST route, making it consistent for local development.
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

    // 2. Extract only the filename from the stored path.
    //    This prevents creating a duplicate path like "uploads/uploads/file.pdf".
    //    `document.path` is "uploads/file.pdf", so `path.basename` gets "file.pdf".
    const filename = path.basename(document.path);

    // 3. Construct the final, absolute path.
    const filePath = path.join(uploadDir, filename);

    // --- END FIX ---

    if (!fs.existsSync(filePath)) {
      // This log is very helpful for debugging path issues.
      console.error(`File not found at path: ${filePath}`);
      return new NextResponse("File not found on server.", { status: 404 });
    }

    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the content type from the stored MIME type or guess from filename
    const contentType =
      document.type ||
      mime.lookup(document.name) ||
      "application/octet-stream";

    // Return the file with the correct headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${document.name}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
