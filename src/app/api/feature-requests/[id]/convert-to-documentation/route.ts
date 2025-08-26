import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DocumentationCategory } from '@prisma/client';

export async function POST(
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

    // Parse the feature request ID
    const featureRequestId = parseInt(params.id);
    
    if (isNaN(featureRequestId)) {
      return NextResponse.json(
        { error: 'Invalid feature request ID' },
        { status: 400 }
      );
    }

    // Get the feature request
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id: featureRequestId },
    });

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (featureRequest.isConverted) {
      return NextResponse.json(
        { 
          error: 'Feature request has already been converted to documentation',
          documentationId: featureRequest.convertedToDocumentationId 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, category, tags } = body;

    // Validate category
    if (!category || !Object.values(DocumentationCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Valid category is required' },
        { status: 400 }
      );
    }

    // Use provided title and content or default from feature request
    const docTitle = title || featureRequest.title;
    const docContent = content || `# ${featureRequest.title}\n\n## Description\n${featureRequest.description}\n\n## Details\n- **Status**: ${featureRequest.status}\n- **Priority**: ${featureRequest.priority}\n- **Submitted By**: ${featureRequest.submittedBy}\n- **Created**: ${featureRequest.createdAt.toISOString()}\n${featureRequest.dueDate ? `- **Due Date**: ${featureRequest.dueDate.toISOString()}` : ''}`;

    // Create documentation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the documentation
      const documentation = await tx.documentation.create({
        data: {
          title: docTitle,
          content: docContent,
          category,
          tags: tags || [],
          isPublished: true,
          sourceFeatureRequestId: featureRequestId,
          userId: user.id,
        },
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

      // Update the feature request
      await tx.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          isConverted: true,
          convertedToDocumentationId: documentation.id,
        },
      });

      return documentation;
    });

    return NextResponse.json({
      success: true,
      documentation: result,
      message: 'Feature request successfully converted to documentation',
    });
  } catch (error) {
    console.error('Error converting feature request to documentation:', error);
    return NextResponse.json(
      { error: 'Failed to convert feature request to documentation' },
      { status: 500 }
    );
  }
}