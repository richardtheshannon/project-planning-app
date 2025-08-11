import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient, BillingCycle } from '@prisma/client';
import * as z from 'zod';

const prisma = new PrismaClient();

const subscriptionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be a positive number"),
  billingCycle: z.nativeEnum(BillingCycle),
  dueDate: z.date().optional().nullable(),
});

/**
 * GET handler for fetching ALL subscriptions for ALL users.
 * ✅ FIX: The user filter has been removed.
 */
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
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: 'asc',
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

/**
 * POST handler for CREATING a new subscription.
 * This remains unchanged as it correctly assigns ownership on creation.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    
    if (body.dueDate) {
        body.dueDate = new Date(body.dueDate);
    }
    
    const validation = subscriptionCreateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ error: 'Invalid input', details: validation.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const { name, amount, billingCycle, dueDate } = validation.data;

    const newSubscription = await prisma.subscription.create({
      data: {
        name,
        amount,
        billingCycle,
        dueDate,
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
