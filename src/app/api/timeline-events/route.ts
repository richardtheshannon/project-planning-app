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
      orderBy: { eventDate: "asc" },
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
        // MODIFIED: Use conditional spreading. If eventDate exists, the eventDate
        // property is added to the object. If not, nothing is added, which
        // avoids all TypeScript errors with `null` or `undefined`.
        ...(eventDate && { eventDate: new Date(eventDate) }),
      },
    });

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
