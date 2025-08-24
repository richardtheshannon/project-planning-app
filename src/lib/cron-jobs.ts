// src/lib/cron-jobs.ts
import cron from 'node-cron';

export function initializeCronJobs() {
  const cronSecret = process.env.CRON_SECRET;
  const baseUrl = process.env.NEXTAUTH_URL || 'https://app.salesfield.net';
  
  if (!cronSecret) {
    console.warn('[CRON] CRON_SECRET not set, skipping cron job initialization');
    return;
  }

  // Morning Manifest - 4 AM daily
  cron.schedule('0 4 * * *', async () => {
    console.log('[CRON] Running morning manifest...');
    try {
      const response = await fetch(`${baseUrl}/api/cron/send-manifest`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CRON] Morning manifest sent successfully:', data);
      } else {
        console.error('[CRON] Morning manifest failed:', response.status);
      }
    } catch (error) {
      console.error('[CRON] Morning manifest error:', error);
    }
  }, {
    timezone: "America/Los_Angeles" // Adjust to your timezone
  });

  // Afternoon Manifest - 4 PM daily  
  cron.schedule('0 16 * * *', async () => {
    console.log('[CRON] Running afternoon manifest...');
    try {
      const response = await fetch(`${baseUrl}/api/cron/send-afternoon-manifest`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[CRON] Afternoon manifest sent successfully:', data);
      } else {
        console.error('[CRON] Afternoon manifest failed:', response.status);
      }
    } catch (error) {
      console.error('[CRON] Afternoon manifest error:', error);
    }
  }, {
    timezone: "America/Los_Angeles" // Adjust to your timezone
  });

  console.log('[CRON] Cron jobs initialized - Morning: 4 AM, Afternoon: 4 PM PST');
}