import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/financials/reports/summary
// ✅ FIX: Calculates a financial summary for ALL users for a given date range
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return new NextResponse(JSON.stringify({ error: 'Start date and end date are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);

    // Use a transaction to perform both aggregations efficiently
    const [incomeResult, expenseResult] = await prisma.$transaction([
      prisma.invoice.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          // The userId filter has been removed to include all users' invoices.
          status: InvoiceStatus.PAID, // Only count paid invoices as income
          issuedDate: {
            gte: fromDate,
            lte: toDate,
          },
        },
      }),
      prisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          // The userId filter has been removed to include all users' expenses.
          date: {
            gte: fromDate,
            lte: toDate,
          },
        },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const netProfit = totalIncome - totalExpenses;

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netProfit,
      startDate,
      endDate,
    });

  } catch (error) {
    console.error('Error generating financial summary:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
