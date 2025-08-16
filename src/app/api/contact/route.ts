// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  console.log('Contact API route hit'); // Add this for debugging
  
  // Ensure the user is authenticated
  const session = await getServerSession(authOptions);
  console.log('Session:', session); // Add this for debugging
  
  if (!session || !session.user) {
    console.log('No session found - returning 401'); // Add this for debugging
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subject, message } = await request.json();

  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
  }

  // Get email credentials from environment variables
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const toEmail = process.env.EMAIL_TO_ADDRESS || 'info@salesfield.net';

  console.log('Email config - User exists:', !!user, 'Pass exists:', !!pass); // Add this for debugging

  if (!user || !pass) {
    console.error('Email server credentials are not set in environment');
    return NextResponse.json({ error: 'Internal server error: Email not configured.' }, { status: 500 });
  }

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    console.log('Attempting to send email...'); // Add this for debugging
    
    // Send mail with defined transport object
    await transporter.sendMail({
      from: `"Project Planning App" <${user}>`, // sender address
      to: toEmail, // list of receivers
      subject: `New Contact Form Submission: ${subject}`, // Subject line
      html: `
        <h1>New Message from Project Planning App</h1>
        <p><strong>From:</strong> ${session.user.name} (${session.user.email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log('Email sent successfully'); // Add this for debugging
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}