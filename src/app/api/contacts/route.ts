// src/app/api/contacts/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
