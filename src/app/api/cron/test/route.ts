// src/app/api/cron/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without calling other endpoints first
    return NextResponse.json({
      message: 'Cron test endpoint is working',
      timestamp: new Date().toISOString(),
      currentUTCHour: new Date().getUTCHours(),
      expectedHours: '11 UTC (4am PDT) or 23 UTC (4pm PDT)',
      cronSecret: process.env.CRON_SECRET ? 'Present' : 'Missing',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test endpoint error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}