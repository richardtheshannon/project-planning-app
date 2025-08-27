// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma"
import { defaultTimelineEvents } from "../../../../timeline-template";
import { z } from 'zod';
import { ProjectStatus, Priority, ProjectType } from '@prisma/client';

// --- GET Handler ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // --- MODIFICATION START ---
    // The 'where' clause has been removed from this query.
    // It now fetches ALL projects from the database, not just those for the logged-in user.
    const projects = await prisma.project.findMany({
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
    // --- MODIFICATION END ---

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// --- Zod Schema for Validation ---
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional().nullable(),
  projectGoal: z.string().optional().nullable(),
  projectValue: z.number().optional().nullable(),
  website: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  projectType: z.nativeEnum(ProjectType).default(ProjectType.PERSONAL_PROJECT),
  startDate: z.union([z.string(), z.null()]).optional().transform((val) => val && val !== '' ? new Date(val) : null),
  endDate: z.union([z.string(), z.null()]).optional().transform((val) => val && val !== '' ? new Date(val) : null),
});


// --- POST Handler (No changes needed here) ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id;

    const body = await request.json();
    console.log('Received body:', body); // Debug logging
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation errors:', validation.error.issues); // Debug logging
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }
    
    const { name, description, projectGoal, projectValue, website, status, priority, projectType, startDate, endDate } = validation.data;

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
