import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient, ExpenseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financials/expenses
// Fetches all expenses for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
      },
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

// POST /api/financials/expenses
// Creates a new expense
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

    // Basic validation
    if (!description || !amount || !category || !date) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Type check for category
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
