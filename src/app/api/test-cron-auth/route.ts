// src/app/api/test-cron-auth/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Build proper URL with https://
    let baseUrl = process.env.NEXTAUTH_URL || '';
    
    // Add https:// if missing
    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    // Fallback to known URL if NEXTAUTH_URL is not set
    if (!baseUrl) {
      baseUrl = 'https://app.salesfield.net';
    }

    console.log('Using base URL:', baseUrl);

    // Test morning manifest with auth
    const morningUrl = `${baseUrl}/api/cron/send-manifest`;
    console.log('Calling:', morningUrl);
    
    const morningResponse = await fetch(morningUrl, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });

    const morningOk = morningResponse.ok;
    const morningStatus = morningResponse.status;
    let morningText = '';
    
    try {
      morningText = await morningResponse.text();
    } catch (e) {
      morningText = 'Could not read response';
    }

    return NextResponse.json({
      test: 'Cron endpoint authorization test',
      baseUrl: baseUrl,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
      cronSecretPresent: !!process.env.CRON_SECRET,
      morningManifest: {
        url: morningUrl,
        ok: morningOk,
        status: morningStatus,
        response: morningText.substring(0, 200) // First 200 chars
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
    }, { status: 500 });
  }
}