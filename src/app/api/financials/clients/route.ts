import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { authOptions } from '@/lib/auth';
import { ContractTerm } from "@prisma/client";

// Updated Zod schema to match the new client fields
const clientSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().nullable().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().nullable().or(z.literal('')),
  billTo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  contractStartDate: z.coerce.date().optional().nullable(),
  contractTerm: z.nativeEnum(ContractTerm).optional().default(ContractTerm.ONE_TIME), // Made optional with default
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  frequency: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  contacts: z.array(z.object({
    name: z.string(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("GET Clients API: Session user ID not found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetches ALL clients from the database
    const clients = await prisma.client.findMany({
      include: {
        contacts: true, // Include contacts in the response
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("POST Clients API: Session user ID not found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Received client data:", body); // Debug log
    
    // Separate contacts from client data
    const { contacts, ...clientData } = body;
    
    // Validate the client data
    const validatedData = clientSchema.parse(clientData);
    
    // Process empty strings to null for database
    const processedData = {
      ...validatedData,
      email: validatedData.email || null,
      website: validatedData.website || null,
      billTo: validatedData.billTo || null,
      phone: validatedData.phone || null,
      address1: validatedData.address1 || null,
      address2: validatedData.address2 || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      zipCode: validatedData.zipCode || null,
      notes: validatedData.notes || null,
      frequency: validatedData.frequency || null,
    };

    // Create client with contacts if provided
    const client = await prisma.client.create({
      data: {
        ...processedData,
        userId: session.user.id,
        // Create contacts if provided
        ...(contacts && contacts.length > 0 && {
          contacts: {
            create: contacts.map((contact: any) => ({
              name: contact.name,
              email: contact.email || null,
              phone: contact.phone || null,
              note: contact.note || null,
            }))
          }
        })
      },
      include: {
        contacts: true, // Include contacts in response
      }
    });

    console.log("Client created successfully:", client.id);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.issues);
      return NextResponse.json({ 
        error: "Invalid data", 
        issues: error.issues 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: "Failed to create client",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}