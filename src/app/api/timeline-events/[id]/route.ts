// src/app/api/timeline-events/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT handler to update a specific timeline event.
 * ✅ FIX: Now correctly handles clearing the event date.
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

    const updatedEvent = await prisma.timelineEvent.update({
      where: { id: eventId },
      data: {
        title,
        description,
        // --- FIX APPLIED HERE ---
        // If eventDate is present, convert it to a Date object.
        // If it's empty or null, explicitly set the database field to null.
        eventDate: eventDate ? new Date(eventDate) : null,
        isCompleted,
      },
    });

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error(`Failed to update timeline event ${params.id}:`, error);
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
 * PATCH handler for calendar drag and drop updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventDate } = body;

    if (!eventDate) {
      return NextResponse.json({ error: 'eventDate is required' }, { status: 400 });
    }

    const timelineEvent = await prisma.timelineEvent.update({
      where: { id: params.id },
      data: { eventDate: new Date(eventDate) },
      select: { id: true, title: true, eventDate: true }
    });

    return NextResponse.json(timelineEvent);
  } catch (error) {
    console.error('Error updating timeline event date:', error);
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a specific timeline event.
 * (No changes needed here)
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

    await prisma.timelineEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error(`Failed to delete timeline event ${params.id}:`, error);
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
