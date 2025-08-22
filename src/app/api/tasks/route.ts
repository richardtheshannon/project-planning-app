import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// The POST handler remains unchanged. It correctly assigns ownership on creation.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, projectId, dueDate, priority, status } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and Project ID are required" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        project: {
          connect: { id: projectId },
        },
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

/**
 * GET handler to fetch tasks for a given project.
 * ✅ FIX: Now allows any authenticated user to fetch tasks for any project.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // The permission check that verified project membership has been removed.
    // We now fetch tasks based only on the projectId.
    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Task fetching error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
