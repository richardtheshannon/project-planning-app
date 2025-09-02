import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dueDate } = body;

    if (!dueDate) {
      return NextResponse.json({ error: 'dueDate is required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { dueDate: new Date(dueDate) },
      select: { id: true, invoiceNumber: true, dueDate: true }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice dueDate:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}