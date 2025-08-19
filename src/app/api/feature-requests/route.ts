import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Corrected import
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all feature requests
export async function GET() {
  try {
    const requests = await prisma.featureRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST a new feature request
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.name) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, priority } = body;

    if (!title || !description || !priority) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const newRequest = await prisma.featureRequest.create({
      data: {
        title,
        description,
        priority,
        submittedBy: session.user.name,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating feature request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}