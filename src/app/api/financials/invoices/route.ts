import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financials/invoices
// Fetches all invoices for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        client: true, // Include the related client information
      },
      orderBy: {
        issuedDate: 'desc',
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch invoices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/financials/invoices
// Creates a new invoice
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { amount, dueDate, issuedDate, clientId, status } = await request.json();

    // Basic validation
    if (!amount || !dueDate || !issuedDate || !clientId || !status) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a simple unique invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        issuedDate: new Date(issuedDate),
        status,
        clientId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create invoice' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
