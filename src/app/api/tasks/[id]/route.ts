// src/app/api/tasks/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface PatchParams {
  params: {
    id: string;
  };
}

// PATCH /api/tasks/[id] - Updates a specific task
export async function PATCH(req: Request, { params }: PatchParams) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskId = params.id;
    const body = await req.json();
    // Step 1: Removed assigneeId from the request body
    const { title, description, status, priority, dueDate } = body;

    // 2. Validate that the task ID was provided
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // 3. Update the task in the database
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        // Step 2: Removed assigneeId from the data being saved
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      // Step 3: Removed the 'include' for assignee as it's no longer needed
    });

    // 4. Return the updated task data
    return NextResponse.json(updatedTask, { status: 200 });

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the task." },
      { status: 500 }
    );
  }
}
