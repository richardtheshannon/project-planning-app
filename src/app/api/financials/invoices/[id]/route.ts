// src/app/api/financials/invoices/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { InvoiceStatus } from "@prisma/client";

// Zod schema for line items
const lineItemSchema = z.object({
  id: z.string().optional(),
  date: z.string().datetime("Invalid date format."),
  description: z.string().min(1, "Description is required"),
  amount: z.number().nonnegative("Amount must be non-negative"),
});

// Zod schema for validating the PATCH request body
const invoiceUpdateSchema = z.object({
  amount: z.number().positive("Amount must be a positive number.").optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  issuedDate: z.string().datetime("Invalid date format.").optional(),
  dueDate: z.string().datetime("Invalid date format.").optional(),
  lineItems: z.array(lineItemSchema).optional(),
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
    // Fetch invoice with client and line items
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
      },
      include: {
        client: true,
        lineItems: {
          orderBy: {
            date: 'asc',
          },
        },
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
    // Start a transaction to handle line items and invoice update together
    const result = await prisma.$transaction(async (tx) => {
      // Handle line items if provided
      if (validation.data.lineItems !== undefined) {
        // Get existing line items
        const existingLineItems = await tx.lineItem.findMany({
          where: { invoiceId: id },
        });

        const existingIds = existingLineItems.map(item => item.id);
        const updatedIds = validation.data.lineItems
          .filter(item => item.id)
          .map(item => item.id!);

        // Delete removed line items
        const idsToDelete = existingIds.filter(id => !updatedIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx.lineItem.deleteMany({
            where: {
              id: { in: idsToDelete },
              invoiceId: id,
            },
          });
        }

        // Update or create line items
        for (const item of validation.data.lineItems) {
          if (item.id) {
            // Update existing item
            await tx.lineItem.update({
              where: { id: item.id },
              data: {
                date: new Date(item.date),
                description: item.description,
                amount: item.amount,
              },
            });
          } else {
            // Create new item
            await tx.lineItem.create({
              data: {
                date: new Date(item.date),
                description: item.description,
                amount: item.amount,
                invoiceId: id,
              },
            });
          }
        }
      }

      // Update the invoice
      const { lineItems, ...invoiceData } = validation.data;
      const updatedInvoice = await tx.invoice.update({
        where: { id: id },
        data: invoiceData,
        include: {
          client: true,
          lineItems: {
            orderBy: {
              date: 'asc',
            },
          },
        },
      });

      return updatedInvoice;
    });

    return NextResponse.json(result);
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
        // Line items will be automatically deleted due to cascade delete in schema
        await prisma.invoice.delete({
            where: {
                id: id,
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