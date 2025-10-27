import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { authOptions } from "@/lib/auth";
import { ContractTerm } from "@prisma/client";

// Updated schema for client with new fields
const clientUpdateSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }).optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')).nullable(),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractTerm: z.enum(['ONE_MONTH', 'ONE_TIME', 'THREE_MONTH', 'SIX_MONTH', 'ONE_YEAR']).optional(),
  frequency: z.string().optional(),
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  
  // New fields
  billTo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  
  // Contacts array
  contacts: z.array(z.object({
    id: z.string().optional(), // For existing contacts
    name: z.string().min(1, "Contact name is required"),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    phone: z.string().optional().or(z.literal('')).nullable(),
    note: z.string().optional().or(z.literal('')).nullable(),
    _action: z.enum(['create', 'update', 'delete']).optional(),
  })).optional(),
}).partial();

/**
 * GET handler for fetching a SINGLE client by its ID, including related invoices and contacts.
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
        userId: session.user.id,
      },
      include: {
        invoices: {
          orderBy: {
            issuedDate: 'desc'
          }
        },
        contacts: {
          orderBy: {
            createdAt: 'asc'
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

        // Extract contacts for separate handling
        const { contacts, ...clientData } = validatedData;

        // Ensure contractTerm is cast to the correct enum type if it exists
        const updateData: any = { ...clientData };
        if (updateData.contractTerm) {
            updateData.contractTerm = updateData.contractTerm as ContractTerm;
        }

        // Update client with transaction to handle contacts
        const updatedClient = await prisma.$transaction(async (tx) => {
            // Update client data
            const client = await tx.client.update({
                where: { id: id },
                data: updateData,
            });

            // Handle contacts if provided
            if (contacts && contacts.length > 0) {
                for (const contact of contacts) {
                    const { _action, id: contactId, ...contactData } = contact;
                    
                    if (_action === 'delete' && contactId) {
                        await tx.clientContact.delete({
                            where: { id: contactId }
                        });
                    } else if (_action === 'update' && contactId) {
                        await tx.clientContact.update({
                            where: { id: contactId },
                            data: contactData as any
                        });
                    } else if (_action === 'create' || !contactId) {
                        await tx.clientContact.create({
                            data: {
                                ...contactData as any,
                                clientId: id
                            }
                        });
                    }
                }
            }

            // Return updated client with contacts
            return await tx.client.findUnique({
                where: { id: id },
                include: { 
                    contacts: true,
                    invoices: {
                        orderBy: {
                            issuedDate: 'desc'
                        }
                    }
                }
            });
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

        // Delete will cascade to contacts due to onDelete: Cascade in schema
        await prisma.client.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error(`Error deleting client with ID: ${id}`, error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}