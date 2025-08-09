// src/app/api/financials/subscriptions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { BillingCycle } from "@prisma/client";

// ✅ STEP 1: Update Zod schema for validation
const subscriptionUpdateSchema = z.object({
  name: z.string().min(1, "Name is required.").optional(),
  amount: z.number().positive("Amount must be a positive number.").optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  dueDate: z.date().optional().nullable(),
});

/**
 * Handles GET requests to fetch a single subscription.
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
    const subscription = await prisma.subscription.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles PATCH requests to update an existing subscription.
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
  
  try {
    const body = await request.json();

    // ✅ STEP 2: Parse dueDate string into a Date object if it exists
    if (body.dueDate) {
        body.dueDate = new Date(body.dueDate);
    }

    const validation = subscriptionUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: validation.error.flatten() },
        { status: 400 }
      );
    }

    // ✅ STEP 3: Update the subscription with the validated data
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: validation.data,
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    // Prisma's error code for a record not found during an update
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a subscription.
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
        await prisma.subscription.delete({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ message: "Subscription deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting subscription:", error);
        if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
