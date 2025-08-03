// src/app/api/timeline-events/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * PUT handler to update a specific timeline event.
 * Can handle partial updates, like just toggling the completion status.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();
    const { title, description, eventDate, isCompleted } = body;

    // First, verify the user owns the project this event belongs to.
    const eventToUpdate = await prisma.timelineEvent.findUnique({
      where: { id: eventId },
      include: { project: true },
    });

    if (!eventToUpdate) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventToUpdate.project.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the event
    const updatedEvent = await prisma.timelineEvent.update({
      where: { id: eventId },
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        isCompleted,
      },
    });

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error(`Failed to update timeline event ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a specific timeline event.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;

    // Verify ownership before deleting
    const eventToDelete = await prisma.timelineEvent.findUnique({
        where: { id: eventId },
        include: { project: true },
    });

    if (!eventToDelete) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventToDelete.project.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.timelineEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Failed to delete timeline event ${params.id}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
