// src/app/api/documents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { Prisma } from "@prisma/client";

// The GET handler is already correctly configured to fetch all documents.
// No changes are needed here.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    const whereClause: Prisma.DocumentWhereInput = {
      userId: session.user.id,
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}


// ✅ --- FIX: The POST handler is updated to accept an optional expenseId ---
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    const title: string | null = data.get('title') as string;
    const projectId: string | null = data.get('projectId') as string;
    // 1. Get the new expenseId from the form data.
    const expenseId: string | null = data.get('expenseId') as string;

    if (!file) {
        return NextResponse.json({ error: "File is required." }, { status: 400 });
    }
    if (!title) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const documentData: Prisma.DocumentCreateInput = {
        title: title,
        name: file.name,
        type: file.type,
        size: file.size,
        path: path.join("uploads", filename).replace(/\\/g, '/'),
        user: {
            connect: { id: session.user.id }
        }
    };

    if (projectId) {
        documentData.project = {
            connect: { id: projectId }
        };
    }

    // 2. If an expenseId was provided, connect the document to the expense.
    if (expenseId) {
        documentData.expense = {
            connect: { id: expenseId }
        };
    }

    const newDocument = await prisma.document.create({
      data: documentData,
    });

    return NextResponse.json(newDocument, { status: 201 });
}
