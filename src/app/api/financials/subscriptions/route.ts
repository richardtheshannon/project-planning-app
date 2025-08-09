import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient, BillingCycle } from '@prisma/client';
import * as z from 'zod';

const prisma = new PrismaClient();

// ✅ STEP 1: Update Zod schema to include the optional and nullable dueDate
const subscriptionCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be a positive number"),
  billingCycle: z.nativeEnum(BillingCycle),
  dueDate: z.date().optional().nullable(),
});

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
    const body = await request.json();
    
    // The body's date will be a string, so we need to parse it for Zod
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
    
    // ✅ STEP 2: Destructure the new dueDate from the validated data
    const { name, amount, billingCycle, dueDate } = validation.data;

    // ✅ STEP 3: Add dueDate to the data object for creation
    const newSubscription = await prisma.subscription.create({
      data: {
        name,
        amount,
        billingCycle,
        dueDate, // Add the due date here
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
