import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentationCategory } from '@prisma/client';

// GET - Get single documentation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentation = await prisma.documentation.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sourceFeatureRequest: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!documentation) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(documentation);
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}

// PATCH - Update documentation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, category, tags, isPublished } = body;

    // Check if documentation exists
    const existingDoc = await prisma.documentation.findUnique({
      where: { id: params.id },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      );
    }

    // Build update data object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    // Validate and update category if provided
    if (category !== undefined) {
      if (!Object.values(DocumentationCategory).includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    // Update documentation
    const updatedDocumentation = await prisma.documentation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sourceFeatureRequest: true,
      },
    });

    return NextResponse.json(updatedDocumentation);
  } catch (error) {
    console.error('Error updating documentation:', error);
    return NextResponse.json(
      { error: 'Failed to update documentation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete documentation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if documentation exists
    const existingDoc = await prisma.documentation.findUnique({
      where: { id: params.id },
      include: {
        sourceFeatureRequest: true,
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      );
    }

    // If this documentation was converted from a feature request, update the feature request
    if (existingDoc.sourceFeatureRequest) {
      await prisma.featureRequest.update({
        where: { id: existingDoc.sourceFeatureRequest.id },
        data: {
          isConverted: false,
          convertedToDocumentationId: null,
        },
      });
    }

    // Delete the documentation
    await prisma.documentation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Documentation deleted successfully' });
  } catch (error) {
    console.error('Error deleting documentation:', error);
    return NextResponse.json(
      { error: 'Failed to delete documentation' },
      { status: 500 }
    );
  }
}