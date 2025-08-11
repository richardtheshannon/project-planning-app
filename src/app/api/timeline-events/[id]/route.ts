// src/app/api/timeline-events/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * PUT handler to update a specific timeline event.
 * ✅ FIX: Now allows any authenticated user to update any event.
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

    // The permission check that verified project ownership has been removed.

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
    // Handle cases where the event might not be found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a specific timeline event.
 * ✅ FIX: Now allows any authenticated user to delete any event.
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

    // The permission check that verified project ownership has been removed.

    await prisma.timelineEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Failed to delete timeline event ${params.id}:`, error);
    // Handle cases where the event might not be found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
