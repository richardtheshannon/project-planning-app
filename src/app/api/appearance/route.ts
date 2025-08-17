import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { AppearanceSettingsSchema } from '@/lib/schemas/appearance';
import { authOptions } from '../auth/[...nextauth]/route';


/**
 * @description Fetches the global appearance settings for the application.
 * If no settings exist, it creates and returns a default record.
 */
export async function GET() {
  try {
    // Upsert ensures that a settings record always exists.
    // If it doesn't find one with the ID "global_settings", it creates one.
    const settings = await prisma.appearanceSettings.upsert({
      where: { id: 'global_settings' },
      update: {}, // On GET, we don't need to update anything.
      create: {
        id: 'global_settings',
        // Default values will be set by the prisma schema itself.
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching appearance settings:', error);
    // Return a generic error response.
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * @description Updates the global appearance settings.
 * This function handles PUT requests to update the application's appearance.
 * It validates the incoming data against the AppearanceSettingsSchema.
 */
export async function PUT(request: Request) {
  // Check if the user is authenticated.
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate the request body against our Zod schema.
    const validatedData = AppearanceSettingsSchema.parse(body);

    // Update the single settings record in the database.
    const updatedSettings = await prisma.appearanceSettings.update({
      where: { id: 'global_settings' },
      data: validatedData,
    });

    // Return the updated settings.
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    // If there's a validation error or database error, return a 500 response.
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
