import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/financials/clients
// Fetches all clients for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const clients = await prisma.client.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch clients' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


// POST /api/financials/clients
// Creates a new client
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, email } = await request.json();

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Client name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create client' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
