import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Define an API endpoint for creating and listing tasks.
// This route will handle POST and GET requests for tasks.

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user.
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

    // 2. Parse the request body.
    // Note: We are no longer destructuring 'assigneeId' as it has been removed.
    const body = await request.json();
    const { title, description, projectId, dueDate, priority, status } = body;

    // 3. Validate required fields.
    if (!title || !projectId) {
      return NextResponse.json(
        { error: "Title and Project ID are required" },
        { status: 400 }
      );
    }

    // 4. Create the new task in the database.
    // The 'assignee' connect logic has been removed as per the project update.
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status, // Added status to the creation data
        dueDate: dueDate ? new Date(dueDate) : null,
        project: {
          connect: { id: projectId },
        },
        // The owner of the task is implicitly the project owner or team,
        // direct assignment has been removed for simplification.
      },
    });

    // 5. Respond with the created task.
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user.
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

    // 2. Extract the projectId from the query parameters.
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // 3. Find all tasks associated with the project.
    // It's important to also ensure the user has access to this project.
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        // Check if the user is a member or the owner of the project.
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        tasks: true, // Use include to fetch related tasks
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // 4. Respond with the tasks.
    return NextResponse.json(project.tasks);
  } catch (error) {
    console.error("Task fetching error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
