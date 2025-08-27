// src/app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { testGoogleEmailConfig, sendGoogleEmail } from '@/lib/google-email';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  // Require authentication for security
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First test the configuration
  const configTest = await testGoogleEmailConfig();
  
  if (!configTest.success) {
    return NextResponse.json({ 
      error: 'Gmail API configuration test failed',
      details: configTest.error,
      hint: 'Please check your Google OAuth credentials and ensure Gmail API is enabled'
    }, { status: 500 });
  }
  
  try {
    // Try to send a test email to the logged-in user
    const testEmail = session.user.email || process.env.GOOGLE_EMAIL_FROM;
    
    if (!testEmail) {
      return NextResponse.json({ 
        error: 'No email address available for testing' 
      }, { status: 400 });
    }

    await sendGoogleEmail({
      to: testEmail,
      subject: 'Test Email from Project Planning App',
      text: 'If you receive this, your email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Email Configuration Test Successful!</h2>
          <p>If you're seeing this message, your Google Gmail API configuration is working correctly.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration Status:</h3>
            <ul>
              <li>✅ Google OAuth credentials valid</li>
              <li>✅ Gmail API enabled and accessible</li>
              <li>✅ Refresh token working</li>
              <li>✅ Email sending functional</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            This test was triggered by: ${session.user.name || session.user.email}<br>
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent successfully to ${testEmail}!`,
      configuration: {
        gmailApiEnabled: true,
        authenticationValid: true,
        emailSent: true
      }
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message || 'Unknown error occurred',
      hint: 'Check the server logs for more details'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Alternative POST endpoint for testing with custom recipient
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, message } = await request.json();
    
    if (!to) {
      return NextResponse.json({ 
        error: 'Recipient email address is required' 
      }, { status: 400 });
    }

    await sendGoogleEmail({
      to,
      subject: subject || 'Test Email from Project Planning App',
      text: message || 'This is a test email.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>${subject || 'Test Email'}</h3>
          <p>${message || 'This is a test email sent from the Project Planning App.'}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent by: ${session.user.name || session.user.email}<br>
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${to}` 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message 
    }, { status: 500 });
  }
}