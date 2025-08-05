import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, stat, mkdir, unlink } from "fs/promises";
import path from "path";

async function ensureDirExists(dirPath: string) {
  try {
    await stat(dirPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Use recursive true to create any necessary parent directories
      await mkdir(dirPath, { recursive: true });
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/zip',
  'application/x-rar-compressed',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.zip', '.rar'];
const MAX_FILE_SIZE_MB = 50;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: "File and Project ID are required" }, { status: 400 });
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isTypeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isTypeAllowed && !isExtensionAllowed) {
      return NextResponse.json({ error: `File type "${fileExtension}" is not allowed.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.` }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
        where: { id: projectId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or you do not have permission." }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- FIX START: Change upload directory to the persistent volume ---
    // The '/data' path corresponds to the Mount Path you created in Railway.
    const uploadDir = path.join("/data", "uploads", projectId);
    // --- FIX END ---
    await ensureDirExists(uploadDir);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s/g, '_');
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const newFileRecord = await prisma.file.create({
      data: {
        originalName: file.name,
        filename: filename, // The unique, safe filename
        mimetype: file.type || 'application/octet-stream',
        size: file.size,
        // --- FIX START: Store the full physical path in the database ---
        path: filePath, // e.g., /data/uploads/project_id/unique-file-name.pdf
        // --- FIX END ---
        projectId: projectId,
        uploaderId: userId,
      },
    });

    return NextResponse.json(newFileRecord, { status: 201 });

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const projectWithFiles = await prisma.project.findFirst({
            where: { id: projectId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
            include: { files: { orderBy: { createdAt: 'desc' } } }
        });

        if (!projectWithFiles) {
            return NextResponse.json({ error: "Project not found or you do not have permission." }, { status: 404 });
        }

        return NextResponse.json(projectWithFiles.files);

    } catch (error) {
        console.error("File fetching error:", error);
        return NextResponse.json({ error: "Failed to fetch files." }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('fileId');

        if (!fileId) {
            return NextResponse.json({ error: "File ID is required" }, { status: 400 });
        }

        const fileToDelete = await prisma.file.findUnique({
            where: { id: fileId },
            include: { project: true }
        });

        if (!fileToDelete) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const isProjectOwner = fileToDelete.project?.ownerId === userId;
        const isUploader = fileToDelete.uploaderId === userId;

        if (!isProjectOwner && !isUploader) {
            return NextResponse.json({ error: "You do not have permission to delete this file." }, { status: 403 });
        }

        // --- FIX START: Use the full physical path from the database ---
        // The 'path' field now contains the full path, e.g., /data/uploads/...
        const filePath = fileToDelete.path;
        // --- FIX END ---
        try {
            await unlink(filePath);
        } catch (error: any) {
            // It's okay if the file doesn't exist, we can still delete the DB record
            if (error.code !== 'ENOENT') {
                console.error("Error deleting physical file:", error);
            }
        }

        await prisma.file.delete({
            where: { id: fileId }
        });

        return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("File deletion error:", error);
        return NextResponse.json({ error: "Failed to delete file." }, { status: 500 });
    }
}
