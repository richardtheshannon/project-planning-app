// src/app/api/users/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET handler to fetch current user settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        sendDailyManifest: true,
        sendAfternoonManifest: true,
        enableCloseableNotifications: true,
        closedNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH handler to update user settings
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sendDailyManifest, sendAfternoonManifest, enableCloseableNotifications, closedNotifications, closedNotification } = body;

    // Handle adding a closed notification
    if (closedNotification) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { closedNotifications: true }
      });
      
      const currentClosed = (user?.closedNotifications as string[]) || [];
      if (!currentClosed.includes(closedNotification)) {
        currentClosed.push(closedNotification);
      }
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: { closedNotifications: currentClosed }
      });
      
      return NextResponse.json({ success: true });
    }

    const dataToUpdate: { 
      sendDailyManifest?: boolean; 
      sendAfternoonManifest?: boolean;
      enableCloseableNotifications?: boolean;
      closedNotifications?: string[];
    } = {};

    // Validate and add sendDailyManifest to the update object if it exists
    if (typeof sendDailyManifest === 'boolean') {
      dataToUpdate.sendDailyManifest = sendDailyManifest;
    }

    // Validate and add sendAfternoonManifest to the update object if it exists
    if (typeof sendAfternoonManifest === 'boolean') {
      dataToUpdate.sendAfternoonManifest = sendAfternoonManifest;
    }

    // Validate and add enableCloseableNotifications to the update object if it exists
    if (typeof enableCloseableNotifications === 'boolean') {
      dataToUpdate.enableCloseableNotifications = enableCloseableNotifications;
    }

    // Validate and add closedNotifications to the update object if it exists
    if (Array.isArray(closedNotifications)) {
      dataToUpdate.closedNotifications = closedNotifications;
    }

    // Check if there is anything to update
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ error: 'No valid settings provided for update' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
