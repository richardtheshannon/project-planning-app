// src/app/api/timeline-events/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET handler to fetch all timeline events for a specific project.
 * ✅ FIX: Now allows any authenticated user to fetch events for any project.
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

    // The permission check that verified project membership has been removed.
    
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
 * ✅ FIX: Now allows any authenticated user to create an event for any project.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, eventDate, projectId } = body;

    if (!title || !eventDate || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // The permission check that verified project ownership has been removed.

    const newEvent = await prisma.timelineEvent.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        projectId,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
