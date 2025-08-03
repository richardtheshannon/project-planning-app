// src/app/api/timeline-events/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET handler to fetch all timeline events for a specific project.
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

    // Optional: Add a check to ensure the user has access to this project
    const projectAccess = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id } } }
            ]
        }
    });

    if (!projectAccess) {
        return NextResponse.json({ error: "Forbidden or Project not found" }, { status: 403 });
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
    
    // Optional: Check if user is the project owner before allowing creation
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Only the project owner can add timeline events" }, { status: 403 });
    }

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
