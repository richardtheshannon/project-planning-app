import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { defaultTimelineEvents } from "../../../../timeline-template";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
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

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects GET error:', error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    // MODIFIED: Destructure projectValue from the request body
    const { name, description, projectGoal, projectValue, website, status, priority, projectType, startDate, endDate } = body

    // Use a Prisma transaction to ensure both operations succeed or fail together.
    const newProject = await prisma.$transaction(async (tx) => {
      // 1. Create the project
      const project = await tx.project.create({
        data: {
          name,
          description: description || null,
          projectGoal: projectGoal || null,
          projectValue: projectValue, // NEW: Add projectValue to the data being created
          website: website || null,
          status: status || "PLANNING",
          priority: priority || "MEDIUM",
          projectType: projectType || "PERSONAL_PROJECT",
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          ownerId: user.id
        }
      });

      // 2. Prepare the default timeline events
      const timelineEventsToCreate = defaultTimelineEvents.map(event => ({
        ...event,
        projectId: project.id,
      }));

      // 3. Create the timeline events
      await tx.timelineEvent.createMany({
        data: timelineEventsToCreate,
      });

      // 4. Return the created project
      return project;
    });
    
    // Fetch the project again to include relations for the response
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
