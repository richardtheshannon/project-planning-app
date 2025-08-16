// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { defaultTimelineEvents } from "../../../../timeline-template";
import { z } from 'zod';
import { ProjectStatus, Priority, ProjectType } from '@prisma/client';

// --- GET Handler (Unchanged from your original file) ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const projects = await prisma.project.findMany({
      where: { ownerId: session.user.id }, // Fetch projects for the logged-in user
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// --- Zod Schema for Validation (From my suggestion) ---
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional(),
  projectGoal: z.string().optional(),
  projectValue: z.number().optional(),
  website: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  projectType: z.nativeEnum(ProjectType).default(ProjectType.PERSONAL_PROJECT),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : null),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : null),
});


// --- POST Handler (Merged for the best of both) ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id;

    const body = await request.json();
    // 1. Validate the incoming data
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { name, description, projectGoal, projectValue, website, status, priority, projectType, startDate, endDate } = validation.data;

    // 2. Use a transaction to create project and default timeline events
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          projectGoal,
          projectValue,
          website,
          status,
          priority,
          projectType,
          startDate,
          endDate,
          ownerId: userId
        }
      });

      const timelineEventsToCreate = defaultTimelineEvents.map(event => ({
        ...event,
        projectId: project.id,
      }));

      await tx.timelineEvent.createMany({
        data: timelineEventsToCreate,
      });

      return project;
    });
    
    // 3. Fetch the new project with relations to return to the client
    const projectWithRelations = await prisma.project.findUnique({
        where: { id: newProject.id },
        include: {
            owner: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { tasks: true, members: true }
            }
        }
    });

    return NextResponse.json(projectWithRelations, { status: 201 })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
