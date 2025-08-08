import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as z from "zod";
import { InvoiceStatus } from "@prisma/client";

// Zod schema for CREATING a new invoice
// Aligned field names (e.g., issuedDate) with the Prisma schema.
const invoiceCreateSchema = z.object({
  clientId: z.string().cuid({ message: "A valid client must be selected." }),
  amount: z.number().positive({ message: "Invoice amount must be a positive number." }),
  status: z.nativeEnum(InvoiceStatus),
  issuedDate: z.coerce.date(), // FIX: Renamed from issuedAt to match schema
  dueDate: z.coerce.date(),
});

/**
 * GET handler for fetching ALL invoices for the logged-in user.
 * @param request - The incoming NextRequest.
 * @returns A NextResponse with the invoice data or an error.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        client: {
          userId: session.user.id,
        },
      },
      include: {
        client: {
          select: {
            name: true,
          }
        },
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

/**
 * POST handler for CREATING a new invoice.
 * @param request - The incoming NextRequest with the new invoice data.
 * @returns A NextResponse with the created invoice data or an error.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = invoiceCreateSchema.parse(body);

    // Security check: Ensure the client belongs to the user
    const client = await prisma.client.findFirst({
        where: {
            id: validatedData.clientId,
            userId: session.user.id,
        }
    });

    if (!client) {
        return NextResponse.json({ error: "Client not found or access denied." }, { status: 404 });
    }

    const newInvoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        // --- FIXES ---
        userId: session.user.id, // FIX: Add the required userId
        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`, // FIX: Generate a unique invoice number
      },
      include: {
        client: {
            select: {
                name: true,
            }
        }
      }
    });

    return NextResponse.json(newInvoice, { status: 201 });

  } catch (error) {
    console.error("Error creating invoice:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
