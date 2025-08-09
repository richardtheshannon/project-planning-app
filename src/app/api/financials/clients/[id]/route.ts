import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Zod schema for UPDATING a client.
// The invalid 'ContractTerm' import has been removed.
const clientUpdateSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }).optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  contractStartDate: z.coerce.date().optional().nullable(),
  // contractTerm is now validated as a simple string.
  contractTerm: z.string().optional(),
  frequency: z.string().optional(),
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  notes: z.string().optional(),
}).partial();


/**
 * GET handler for fetching a SINGLE client by its ID, including related invoices.
 * @param request - The incoming NextRequest.
 * @param context - The context containing URL parameters.
 * @param context.params - The URL parameters, expecting `id`.
 * @returns A NextResponse with the client data or an error.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const client = await prisma.client.findUnique({
      where: {
        id: id,
        // Security check: Ensure the client belongs to the logged-in user.
        userId: session.user.id,
      },
      include: {
        invoices: {
          orderBy: {
            issuedDate: 'desc' // Sort invoices with the newest first
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(`Error fetching client with ID: ${id}`, error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

/**
 * PATCH handler for updating a SINGLE client by its ID.
 * @param request - The incoming NextRequest with the update payload.
 * @param context - The context containing URL parameters.
 * @param context.params - The URL parameters, expecting `id`.
 * @returns A NextResponse with the updated client data or an error.
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const body = await request.json();
        const validatedData = clientUpdateSchema.parse(body);

        const existingClient = await prisma.client.findFirst({
            where: { id: id, userId: session.user.id }
        });

        if (!existingClient) {
            return NextResponse.json({ error: "Client not found or you do not have permission to edit it." }, { status: 404 });
        }

        const updatedClient = await prisma.client.update({
            where: { id: id },
            data: validatedData,
        });

        return NextResponse.json(updatedClient);

    } catch (error) {
        console.error(`Error updating client with ID: ${id}`, error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}


/**
 * DELETE handler for deleting a SINGLE client by its ID.
 * @param request - The incoming NextRequest.
 * @param context - The context containing URL parameters.
 * @param context.params - The URL parameters, expecting `id`.
 * @returns A NextResponse with a success message or an error.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const existingClient = await prisma.client.findFirst({
            where: { id: id, userId: session.user.id }
        });

        if (!existingClient) {
            return NextResponse.json({ error: "Client not found or you do not have permission to delete it." }, { status: 404 });
        }

        await prisma.client.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting client with ID: ${id}`, error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
