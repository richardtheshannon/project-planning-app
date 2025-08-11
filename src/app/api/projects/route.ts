import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// ✅ --- FIX: GET handler updated to fetch projects for ALL users ---
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // We still check for a session to ensure only authenticated users can access projects.
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // The logic to find the specific user is no longer needed here, but we keep the session check.
    
    // The `where` clause has been removed from this query.
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
// --- END FIX ---


// The POST handler remains unchanged. It correctly assigns ownership on creation.
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
    const { name, description, projectGoal, website, status, priority, startDate, endDate } = body

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        projectGoal: projectGoal || null,
        website: website || null,
        status: status || "PLANNING",
        priority: priority || "MEDIUM",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId: user.id
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
