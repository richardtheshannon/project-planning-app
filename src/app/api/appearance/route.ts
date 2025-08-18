import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
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
        // Default values will be set by the prisma schema itself (e.g., null).
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[API/APPEARANCE] Error fetching settings:', error);
    // Return a generic error response.
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch settings.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * @description Updates or creates the global appearance settings.
 * This function handles PUT requests to update the application's appearance.
 * It validates the incoming data and uses `upsert` for a safe database operation.
 */
export async function PUT(request: Request) {
  // 1. Check if the user is authenticated.
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Not authenticated' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    console.log('[API/APPEARANCE] Received payload for PUT:', body);
    
    // 2. Validate the request body against our Zod schema.
    const validatedData = AppearanceSettingsSchema.parse(body);
    console.log('[API/APPEARANCE] Payload passed validation:', validatedData);

    // 3. Use `upsert` to safely update or create the settings record.
    // This prevents errors if the record doesn't exist yet.
    const updatedSettings = await prisma.appearanceSettings.upsert({
      where: { id: 'global_settings' },
      update: validatedData,
      create: {
        id: 'global_settings',
        ...validatedData,
      },
    });

    console.log('[API/APPEARANCE] Successfully saved settings:', updatedSettings);
    // 4. Return the updated settings.
    return NextResponse.json(updatedSettings);

  } catch (error) {
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      console.error('[API/APPEARANCE] Validation error:', error.issues);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid data provided.', details: error.issues }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle other errors (e.g., database connection)
    console.error('[API/APPEARANCE] Error updating settings:', error);
    return new NextResponse(
      JSON.stringify({ error: 'An internal error occurred.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
