import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://app.salesfield.net'}/api/cron`, {
      method: 'POST', // Using POST to trigger our manual test endpoint
    });
    
    const data = await response.json();
    return NextResponse.json({
      message: 'Manual cron test',
      currentTime: new Date().toISOString(),
      currentUTCHour: new Date().getUTCHours(),
      expectedHours: '11 UTC (4am PDT) or 23 UTC (4pm PDT)',
      result: data
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}