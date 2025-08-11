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
        userId: session.user.id, // Security check: user can only access their own files
      },
    });

    if (!document) {
      return new NextResponse("File not found or access denied", {
        status: 404,
      });
    }

    // Construct the absolute path to the file
    // It's crucial that UPLOAD_DIR points to the *root* of your uploads folder
    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), "public");
    const filePath = path.join(uploadDir, document.path);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return new NextResponse("File not found on server.", { status: 404 });
    }

    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Determine the content type from the stored MIME type or guess from filename
    const contentType = document.type || mime.lookup(document.name) || 'application/octet-stream';

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
