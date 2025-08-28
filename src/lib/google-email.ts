// src/lib/google-email.ts
import { google } from 'googleapis';

// Initialize OAuth2 client
let oauth2Client: InstanceType<typeof google.auth.OAuth2> | null = null;

/**
 * Initialize Google OAuth2 client for Gmail API
 */
function getOAuth2Client(): InstanceType<typeof google.auth.OAuth2> {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    );

    // Set credentials using refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
  }
  
  return oauth2Client;
}

/**
 * Creates a MIME message for email
 */
function createMimeMessage({
  to,
  from,
  subject,
  text,
  html
}: {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}): string {
  const boundary = "boundary_" + Date.now();
  
  let message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`
  ];

  // Add plain text part if provided
  if (text) {
    message.push(
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      text,
      '',
      `--${boundary}`
    );
  }

  // Add HTML part if provided
  if (html) {
    message.push(
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      '',
      `--${boundary}--`
    );
  } else if (!text) {
    // If neither text nor html is provided, close the boundary
    message[message.length - 1] = `--${boundary}--`;
  }

  return message.join('\r\n');
}

/**
 * Send email using Gmail API
 */
export async function sendGoogleEmail({
  to,
  subject,
  text,
  html,
  from
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}) {
  try {
    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });
    
    // IMPORTANT: Gmail API requires the "from" address to be the authenticated user's email
    // We can only send from the Gmail account that was used to authenticate
    const authenticatedEmail = process.env.GOOGLE_EMAIL_FROM;
    if (!authenticatedEmail) {
      throw new Error('GOOGLE_EMAIL_FROM environment variable is required');
    }
    
    // Use the authenticated email address as the sender
    const fromAddress = `"Project Planning App" <${authenticatedEmail}>`;
    
    // Create the email message
    const message = createMimeMessage({
      to,
      from: fromAddress,
      subject,
      text,
      html
    });

    // Encode in base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log(`[Google Email] Email sent successfully to ${to}. Message ID: ${result.data.id}`);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error(`[Google Email] Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Test Google Email configuration
 */
export async function testGoogleEmailConfig(): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });
    
    // Try to get user profile to verify authentication
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    console.log('[Google Email] Configuration test successful. Email address:', profile.data.emailAddress);
    return { success: true };
  } catch (error: any) {
    console.error('[Google Email] Configuration test failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to authenticate with Gmail API' 
    };
  }
}

/**
 * Send email with invoice attachment using Gmail API
 */
export async function sendInvoiceEmail(
  to: string,
  subject: string,
  htmlBody: string,
  pdfBuffer: Buffer,
  invoiceNumber: string
): Promise<void> {
  try {
    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });
    
    // Get authenticated email
    const authenticatedEmail = process.env.GOOGLE_EMAIL_FROM;
    if (!authenticatedEmail) {
      throw new Error('GOOGLE_EMAIL_FROM environment variable is required');
    }

    // Create email with attachment
    const boundary = 'boundary_' + Date.now();
    const messageParts = [
      `From: "SalesField Network" <${authenticatedEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      htmlBody,
      '',
      `--${boundary}`,
      'Content-Type: application/pdf',
      `Content-Disposition: attachment; filename="invoice-${invoiceNumber}.pdf"`,
      'Content-Transfer-Encoding: base64',
      '',
      pdfBuffer.toString('base64'),
      `--${boundary}--`
    ];

    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`[Google Email] Invoice email sent successfully to ${to}. Message ID: ${result.data.id}`);
  } catch (error) {
    console.error('[Google Email] Failed to send invoice email:', error);
    throw new Error('Failed to send invoice email');
  }
}

/**
 * Send batch emails efficiently
 */
export async function sendBatchGoogleEmails(
  emails: Array<{
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }>
): Promise<Array<{ to: string; success: boolean; error?: string }>> {
  const results: Array<{ to: string; success: boolean; error?: string }> = [];
  
  // Process emails in smaller batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(email => sendGoogleEmail(email))
    );
    
    batchResults.forEach((result, index) => {
      const email = batch[index];
      if (result.status === 'fulfilled') {
        results.push({ to: email.to, success: true });
      } else {
        results.push({ 
          to: email.to, 
          success: false, 
          error: result.reason?.message || 'Unknown error' 
        });
      }
    });
    
    // Add a small delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}