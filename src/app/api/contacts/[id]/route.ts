// src/app/api/contacts/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface PatchParams {
  params: {
    id: string;
  };
}

// PATCH /api/contacts/[id] - Updates a specific contact
export async function PATCH(req: Request, { params }: PatchParams) {
  // 1. Authenticate the user to ensure they are logged in
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contactId = params.id;
    const body = await req.json();
    const { name, email, phone, company, role, notes } = body;

    // 2. Validate that the contact ID was provided in the URL
    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    // 3. Update the contact in the database using its unique ID
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        name,
        email,
        phone,
        company,
        role,
        notes,
      },
    });

    // 4. Return the updated contact data with a success status
    return NextResponse.json(updatedContact, { status: 200 });

  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the contact." },
      { status: 500 }
    );
  }
}
