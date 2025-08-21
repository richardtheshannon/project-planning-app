// src/app/api/test-cron-auth/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test morning manifest with auth
    const morningResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://app.salesfield.net'}/api/cron/send-manifest`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });

    const morningOk = morningResponse.ok;
    const morningStatus = morningResponse.status;
    const morningText = await morningResponse.text();

    return NextResponse.json({
      test: 'Cron endpoint authorization test',
      cronSecretPresent: !!process.env.CRON_SECRET,
      morningManifest: {
        ok: morningOk,
        status: morningStatus,
        response: morningText.substring(0, 200) // First 200 chars
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}