import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;
    const { fileId } = params;

    if (!fileId) {
      return new NextResponse("File ID is required", { status: 400 });
    }

    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        project: {
          select: {
            ownerId: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    // --- FIX START: Add check for the file record and its associated project ---
    if (!fileRecord || !fileRecord.project) {
      return new NextResponse("File not found or is not associated with a project.", { status: 404 });
    }
    // --- FIX END ---

    const isOwner = fileRecord.project.ownerId === userId;
    const isMember = fileRecord.project.members.some(
      (member) => member.userId === userId
    );

    if (!isOwner && !isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = fileRecord.path;

    // Check if the file exists on the volume
    try {
      await stat(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.error(`File not found on disk: ${filePath}`);
        return new NextResponse("File not found on server storage.", { status: 404 });
      }
      throw error;
    }
    
    // Stream the file
    const fileStream = createReadStream(filePath);
    const readableStream = new Readable().wrap(fileStream);

    return new NextResponse(readableStream as any, {
      status: 200,
      headers: {
        "Content-Type": fileRecord.mimetype,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileRecord.originalName)}"`,
      },
    });

  } catch (error) {
    console.error("File download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
