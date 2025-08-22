import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { authOptions } from '@/lib/auth';
import { ContractTerm } from "@prisma/client";

// Zod schema for server-side validation (no changes needed here)
const clientSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractTerm: z.nativeEnum(ContractTerm),
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("GET Clients API: Session user ID not found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // --- MODIFICATION START ---
    // The 'where' clause has been removed from this query.
    // It now fetches ALL clients from the database, not just those for the logged-in user.
    const clients = await prisma.client.findMany();
    // --- MODIFICATION END ---
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// The POST handler remains unchanged, as new clients should still be associated with the user who creates them.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("POST Clients API: Session user ID not found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = clientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
