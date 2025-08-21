// src/app/api/cron/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify this is a Railway cron request or has proper authorization
  const authHeader = request.headers.get('authorization');
  const railwayCronHeader = request.headers.get('x-railway-cron');
  
  // Log headers for debugging
  console.log('Cron request received:', {
    authorization: authHeader ? 'Present' : 'Missing',
    railwayCron: railwayCronHeader,
    timestamp: new Date().toISOString()
  });

  // Railway might send cron requests with x-railway-cron header instead of authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !railwayCronHeader) {
    console.log('Cron auth failed - no valid authentication');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const hour = now.getUTCHours();
    
    console.log(`Cron job running at ${now.toISOString()}, UTC hour: ${hour}`);

    // Determine which manifest to send based on the hour
    // For PDT (UTC-7) - Current summer time:
    // 4 AM PDT = 11:00 UTC
    // 4 PM PDT = 23:00 UTC
    
    let endpoint = '';
    let manifestType = '';
    
    if (hour === 11) { // 11:00 UTC = 4:00 AM PDT
      endpoint = '/api/cron/send-manifest';
      manifestType = 'morning';
    } else if (hour === 23) { // 23:00 UTC = 4:00 PM PDT
      endpoint = '/api/cron/send-afternoon-manifest';
      manifestType = 'afternoon';
    } else {
      // This shouldn't happen if cron is configured correctly
      return NextResponse.json({ 
        message: 'No manifest scheduled for this hour',
        hour: hour,
        timestamp: now.toISOString(),
        note: 'Expected hours are 11 (4am PDT) or 23 (4pm PDT)'
      });
    }

    console.log(`Sending ${manifestType} manifest...`);

    // Call the appropriate manifest endpoint
    const baseUrl = process.env.NEXTAUTH_URL || `https://${request.headers.get('host')}`;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send ${manifestType} manifest: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log(`${manifestType} manifest sent successfully:`, result);
    
    return NextResponse.json({
      success: true,
      type: manifestType,
      hour: hour,
      timestamp: now.toISOString(),
      result: result
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// For manual testing - this lets you trigger it via POST request
export async function POST(request: Request) {
  console.log('Manual cron trigger requested');
  
  // Allow manual triggering for testing
  const testRequest = new Request(request.url, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  
  return GET(testRequest);
}