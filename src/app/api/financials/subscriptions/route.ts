import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financials/subscriptions
// Fetches all subscriptions for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        nextPaymentDate: 'asc',
      },
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/financials/subscriptions
// Creates a new subscription
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, amount, billingCycle, nextPaymentDate } = await request.json();

    // Basic validation
    if (!name || !amount || !billingCycle || !nextPaymentDate) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newSubscription = await prisma.subscription.create({
      data: {
        name,
        amount: parseFloat(amount),
        billingCycle,
        nextPaymentDate: new Date(nextPaymentDate),
        userId: session.user.id,
      },
    });

    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create subscription' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
