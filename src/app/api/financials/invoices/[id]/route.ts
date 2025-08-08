// src/app/api/financials/invoices/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma"; // Corrected import
import * as z from "zod";
import { InvoiceStatus } from "@prisma/client";

// Zod schema for validating the PATCH request body
const invoiceUpdateSchema = z.object({
  amount: z.number().positive("Amount must be a positive number.").optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  issuedDate: z.string().datetime("Invalid date format.").optional(),
  dueDate: z.string().datetime("Invalid date format.").optional(),
});

/**
 * Handles GET requests to fetch a single invoice.
 * @param request - The incoming NextRequest.
 * @param params - The route parameters, containing the invoice id.
 * @returns A NextResponse with the invoice data or an error message.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
        userId: session.user.id, // Security check: ensures user owns the invoice
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles PATCH requests to update an existing invoice.
 * @param request - The incoming NextRequest.
 * @param params - The route parameters, containing the invoice id.
 * @returns A NextResponse with the updated invoice data or an error message.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();

  const validation = invoiceUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: validation.error.issues },
      { status: 400 }
    );
  }

  try {
    // The 'where' clause ensures a user can only update their own invoice.
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: validation.data,
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    // Handle cases where the invoice might not exist
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove an invoice.
 * @param request - The incoming NextRequest.
 * @param params - The route parameters, containing the invoice id.
 * @returns A NextResponse with a success message or an error.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        // The 'where' clause ensures a user can only delete their own invoice.
        await prisma.invoice.delete({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
