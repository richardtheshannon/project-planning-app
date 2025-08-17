import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/appearance:
 * get:
 * summary: Retrieves the global appearance settings
 * description: >
 * Fetches the single, global appearance settings record for the application.
 * If no settings record exists, it creates a default one and returns it.
 * This ensures that the application always has a settings object to work with.
 * tags: [Appearance]
 * responses:
 * 200:
 * description: Successfully retrieved or created the appearance settings.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AppearanceSettings'
 * 500:
 * description: Internal server error.
 */
export async function GET() {
  try {
    // Upsert ensures that a settings record always exists.
    // If it doesn't find one with the ID "global_settings", it creates one.
    const settings = await prisma.appearanceSettings.upsert({
      where: { id: 'global_settings' },
      update: {}, // Nothing to update on a GET request
      create: {
        id: 'global_settings',
        // Default values will be set by the schema
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * @swagger
 * /api/appearance:
 * post:
 * summary: Updates the global appearance settings
 * description: >
 * Updates the global appearance settings for the application.
 * Requires user authentication. The request body should contain
 * the fields of the AppearanceSettings model to be updated.
 * tags: [Appearance]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * businessName:
 * type: string
 * missionStatement:
 * type: string
 * lightModeLogoUrl:
 * type: string
 * lightModeIconUrl:
 * type: string
 * darkModeLogoUrl:
 * type: string
 * darkModeIconUrl:
 * type: string
 * primaryBackgroundColor:
 * type: string
 * secondaryBackgroundColor:
 * type: string
 * tertiaryBackgroundColor:
 * type: string
 * primaryColor:
 * type: string
 * secondaryColor:
 * type: string
 * tertiaryColor:
 * type: string
 * responses:
 * 200:
 * description: Successfully updated the appearance settings.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AppearanceSettings'
 * 401:
 * description: Not authenticated.
 * 400:
 * description: Bad request, invalid data.
 * 500:
 * description: Internal server error.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    const body = await request.json();
    
    const updatedSettings = await prisma.appearanceSettings.update({
      where: { id: 'global_settings' },
      data: {
        ...body,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
