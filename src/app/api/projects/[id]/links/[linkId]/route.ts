import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.projectLink.delete({
      where: { id: params.linkId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project link:', error);
    return NextResponse.json({ error: 'Failed to delete project link' }, { status: 500 });
  }
}

// PUT update link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; linkId: string } }
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

    const link = await prisma.projectLink.update({
      where: { id: params.linkId },
      data: { title, url }
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Failed to update project link:', error);
    return NextResponse.json({ error: 'Failed to update project link' }, { status: 500 });
  }
}