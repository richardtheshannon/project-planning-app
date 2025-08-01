// src/app/api/projects/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Ensure this path is correct
import { prisma } from "@/lib/prisma"; // Corrected: Use named import
import type { Contact } from "@prisma/client"; // Import Prisma-generated types

// Define types for the nested objects to help TypeScript
type MemberWithUser = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type ProjectContactWithContact = {
  contact: Contact;
};


/**
 * GET handler to fetch a single project by its ID.
 * This function now correctly includes related members and contacts
 * and provides explicit types to avoid 'any' type errors.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        contacts: {
          include: {
            contact: true,
          },
        },
        tasks: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { tasks: true, members: true, files: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Corrected: Added explicit type 'MemberWithUser' to the 'member' parameter
    const isOwnerOrMember =
      project.ownerId === user.id ||
      project.members.some((member: MemberWithUser) => member.user.id === user.id);

    if (!isOwnerOrMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Clean up the members and contacts arrays to return a simpler structure to the client.
    const projectWithCleanedData = {
      ...project,
      // Corrected: Added explicit type 'MemberWithUser' to the 'member' parameter
      members: project.members.map((member: MemberWithUser) => member.user),
      // Corrected: Added explicit type 'ProjectContactWithContact' to the 'projectContact' parameter
      contacts: project.contacts.map((projectContact: ProjectContactWithContact) => projectContact.contact),
    };

    return NextResponse.json(projectWithCleanedData);
  } catch (error) {
    console.error("Single project fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// IMPORTANT: If you had PUT, POST, or DELETE functions in this file,
// you will need to add them back below this GET function.
