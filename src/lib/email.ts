import nodemailer from 'nodemailer';
import { sendGoogleEmail } from './google-email';

// Check if Google Email is configured
const useGoogleEmail = !!(
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET && 
  process.env.GOOGLE_REFRESH_TOKEN
);

// Fallback to nodemailer if Google Email is not configured
const transporter = !useGoogleEmail ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465', // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}) : null;

/**
 * Sends an email using Google Gmail API or fallback to Nodemailer.
 * @param to The recipient's email address.
 * @param subject The subject line of the email.
 * @param text The plain-text body of the email.
 * @param html The HTML body of the email (optional).
 */
export async function sendEmail({ to, subject, text, html }: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    if (useGoogleEmail) {
      // Use Google Gmail API
      await sendGoogleEmail({ to, subject, text, html });
      console.log(`Email sent successfully to ${to} via Gmail API`);
    } else if (transporter) {
      // Fallback to nodemailer
      const info = await transporter.sendMail({
        from: `"Project Planner" <${process.env.EMAIL_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
      });
      console.log(`Email sent successfully to ${to} via SMTP. Message ID: ${info.messageId}`);
    } else {
      throw new Error('No email service configured. Please set up Google Email or SMTP credentials.');
    }
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error; // Re-throw to let caller handle
  }
}
