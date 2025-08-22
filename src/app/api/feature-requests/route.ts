import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureRequests = await prisma.featureRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(featureRequests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received feature request data:', body);

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create the feature request - DO NOT include 'id' field
    const featureRequest = await prisma.featureRequest.create({
      data: {
        title: body.title,
        description: body.description || '',
        status: body.status || 'Pending',
        priority: body.priority || 'Medium',
        submittedBy: body.submittedBy || session.user?.name || session.user?.email || 'Unknown',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    console.log('Created feature request:', featureRequest);

    return NextResponse.json(featureRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating feature request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
