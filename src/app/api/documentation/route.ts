import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';  // Changed from default import

// Enum definition (until Prisma generates it)
enum DocumentationCategory {
  DEVELOPMENT = 'DEVELOPMENT',
  PROJECTS = 'PROJECTS',
  CLIENTS = 'CLIENTS',
  OPERATIONS = 'OPERATIONS',
  FINANCIALS = 'FINANCIALS',
  SETTINGS = 'SETTINGS'
}

// GET - List all documentation with filters
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category && Object.values(DocumentationCategory).includes(category as DocumentationCategory)) {
      where.category = category;
    }

    // Get total count for pagination
    const totalCount = await prisma.documentation.count({ where });

    // Get paginated results
    const documentation = await prisma.documentation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
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
          },
        },
      },
    });

    return NextResponse.json({
      documentation,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}

// POST - Create new documentation
export async function POST(request: NextRequest) {
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
    const { title, content, category, tags, isPublished, sourceFeatureRequestId } = body;

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(DocumentationCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create documentation
    const documentation = await prisma.documentation.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        isPublished: isPublished !== undefined ? isPublished : true,
        sourceFeatureRequestId: sourceFeatureRequestId ? parseInt(sourceFeatureRequestId) : null,
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

    // If this was created from a feature request, update the feature request
    if (sourceFeatureRequestId) {
      await prisma.featureRequest.update({
        where: { id: parseInt(sourceFeatureRequestId) },
        data: {
          isConverted: true,
          convertedToDocumentationId: documentation.id,
        },
      });
    }

    return NextResponse.json(documentation, { status: 201 });
  } catch (error) {
    console.error('Error creating documentation:', error);
    return NextResponse.json(
      { error: 'Failed to create documentation' },
      { status: 500 }
    );
  }
}