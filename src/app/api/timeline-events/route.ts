// src/app/api/timeline-events/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET handler to fetch all timeline events for a specific project.
 * Allows any authenticated user to fetch events for any project.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    
    const timelineEvents = await prisma.timelineEvent.findMany({
      where: { projectId },
    });

    // Sort the events in JavaScript to avoid database-specific issues.
    timelineEvents.sort((a, b) => {
      // If both have dates, sort by date.
      if (a.eventDate && b.eventDate) {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      // If only 'a' has a date, it comes first.
      if (a.eventDate) {
        return -1;
      }
      // If only 'b' has a date, it comes first.
      if (b.eventDate) {
        return 1;
      }
      // If neither has a date, sort by creation time.
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json(timelineEvents);

  } catch (error) {
    console.error("Failed to fetch timeline events:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST handler to create a new timeline event.
 * Allows any authenticated user to create an event for any project.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, eventDate, projectId } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const newEvent = await prisma.timelineEvent.create({
      data: {
        title,
        description,
        projectId,
        // Explicitly handle empty/null dates to prevent invalid data.
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
