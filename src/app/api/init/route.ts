// src/app/api/init/route.ts
import { NextResponse } from 'next/server';
import { initializeCronJobs } from '@/lib/cron-jobs';

// This will be called once when the app starts
let cronInitialized = false;

export async function GET() {
  if (!cronInitialized) {
    initializeCronJobs();
    cronInitialized = true;
    return NextResponse.json({ 
      message: 'Cron jobs initialized',
      jobs: ['Morning manifest (4 AM PST)', 'Afternoon manifest (4 PM PST)'],
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({ 
    message: 'Cron jobs already running',
    initialized: true,
    timestamp: new Date().toISOString()
  });
}