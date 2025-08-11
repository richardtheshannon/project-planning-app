import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from "@/lib/prisma"; // Use the centralized prisma instance
import { ExpenseCategory } from '@prisma/client';

// ✅ --- FIX: GET handler updated to fetch expenses for ALL users ---
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // The `where` clause that filtered by userId has been removed.
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch expenses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
// --- END FIX ---

// The POST handler remains unchanged. It correctly assigns ownership on creation.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { description, amount, category, date } = await request.json();

    if (!description || !amount || !category || !date) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Object.values(ExpenseCategory).includes(category)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid expense category' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        userId: session.user.id,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create expense' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
