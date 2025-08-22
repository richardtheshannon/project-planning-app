// src/app/api/projects/[id]/contacts/route.ts

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST handler to add an existing contact to a project.
 * This creates an entry in the ProjectContact join table.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { contactId } = await request.json();
    const projectId = params.id;

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // 1. Verify the project exists and the user is a member or owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwnerOrMember =
      project.ownerId === currentUser.id ||
      project.members.some((member) => member.userId === currentUser.id);

    if (!isOwnerOrMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project" },
        { status: 403 }
      );
    }
    
    // 2. Verify the contact exists
    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
    });

    if (!contact) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // 3. Create the link in the ProjectContact table
    const newProjectContact = await prisma.projectContact.create({
      data: {
        projectId: projectId,
        contactId: contactId,
      },
      include: {
        contact: true, // Include the full contact details in the response
      }
    });

    return NextResponse.json(newProjectContact, { status: 201 });
    
  } catch (error: any) {
    // Handle potential errors, like if the contact is already on the project
    if (error.code === 'P2002') { // Prisma unique constraint violation code
        return NextResponse.json({ error: "This contact is already on the project" }, { status: 409 });
    }
    console.error("Failed to add contact to project:", error);
    return NextResponse.json(
      { error: "Failed to add contact to project" },
      { status: 500 }
    );
  }
}
