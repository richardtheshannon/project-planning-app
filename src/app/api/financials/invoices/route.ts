import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from '@/lib/auth';
import * as z from "zod";
import { InvoiceStatus } from "@prisma/client";

// Zod schema for CREATING a new invoice
const invoiceCreateSchema = z.object({
  clientId: z.string().cuid({ message: "A valid client must be selected." }),
  amount: z.number().positive({ message: "Invoice amount must be a positive number." }),
  status: z.nativeEnum(InvoiceStatus),
  issuedDate: z.coerce.date(),
  dueDate: z.coerce.date(),
});

/**
 * GET handler for fetching ALL invoices for ALL users.
 * ✅ FIX: The user filter has been removed.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // The `where` clause that filtered by the user has been removed.
    const invoices = await prisma.invoice.findMany({
      include: {
        client: {
          select: {
            name: true,
          }
        },
      },
      orderBy: {
        issuedDate: 'desc'
      }
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

/**
 * POST handler for CREATING a new invoice.
 * ✅ FIX: The security check for client ownership has been removed.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = invoiceCreateSchema.parse(body);

    // The security check to ensure the client belongs to the user has been removed.
    
    const newInvoice = await prisma.invoice.create({
      data: {
        ...validatedData,
        userId: session.user.id, 
        invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
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
