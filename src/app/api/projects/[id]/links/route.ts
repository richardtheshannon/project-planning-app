import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all links for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.projectLink.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Failed to fetch project links:', error);
    return NextResponse.json({ error: 'Failed to fetch project links' }, { status: 500 });
  }
}

// POST new link
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, url } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const link = await prisma.projectLink.create({
      data: {
        title,
        url,
        projectId: params.id
      }
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Failed to create project link:', error);
    return NextResponse.json({ error: 'Failed to create project link' }, { status: 500 });
  }
}