// src/app/api/contacts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";

/**
 * GET handler to fetch all contacts from the database.
 * Ensures that only authenticated users can access this list.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Secure the endpoint: only authenticated users can see contacts.
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await prisma.contact.findMany({
      orderBy: {
        name: 'asc', // Order contacts alphabetically by name
      },
    });

    return NextResponse.json(contacts);

  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}


/**
 * POST handler to create a new contact and link it to a project.
 * This is the new function that powers our "create contact" form.
 */
export async function POST(req: Request) {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Parse the incoming request body for contact details
    const body = await req.json();
    const { projectId, name, email, phone, company, role, notes } = body;

    // 3. Validate that the required fields are present
    if (!projectId || !name) {
      return NextResponse.json(
        { error: "Project ID and contact name are required" },
        { status: 400 }
      );
    }

    // 4. Create the new contact and the project link in a single database transaction
    // This ensures data integrity.
    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        role,
        notes,
        // This nested 'create' automatically creates the link in the ProjectContact table
        projects: {
          create: [
            {
              projectId: projectId,
            },
          ],
        },
      },
    });

    // 5. Return the newly created contact data with a "201 Created" status
    return NextResponse.json(newContact, { status: 201 });

  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the contact." },
      { status: 500 }
    );
  }
}
