import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { sendInvoiceEmail } from '@/lib/google-email';
import { z } from 'zod';

// Helper function to validate comma-separated email addresses
const validateEmailList = (emailString: string): boolean => {
  if (!emailString || emailString.trim() === '') return true; // Empty is valid for optional fields
  const emails = emailString.split(',').map(e => e.trim()).filter(e => e.length > 0);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every(email => emailRegex.test(email));
};

const emailSchema = z.object({
  to: z.string().min(1).refine(
    (val) => validateEmailList(val) && val.trim().length > 0,
    { message: 'To field must contain at least one valid email address' }
  ),
  cc: z.string().optional().refine(
    (val) => !val || validateEmailList(val),
    { message: 'CC field must contain valid email addresses separated by commas' }
  ),
  bcc: z.string().optional().refine(
    (val) => !val || validateEmailList(val),
    { message: 'BCC field must contain valid email addresses separated by commas' }
  ),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    // Fetch invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        lineItems: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Create HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #008000;">SalesField Network</h2>
        <hr style="border: 1px solid #e0e0e0;">
        <div style="margin: 20px 0;">
          ${validatedData.message.replace(/\n/g, '<br>')}
        </div>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 14px;">
          <strong>Invoice Details:</strong><br>
          Invoice Number: ${invoice.invoiceNumber}<br>
          Amount Due: $${invoice.amount.toFixed(2)}<br>
          Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
        </p>
        <p style="color: #666; font-size: 12px;">
          Please find the invoice attached to this email. If you have any questions, 
          please don't hesitate to contact us.
        </p>
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          SalesField Network<br>
          richard@salesfield.net<br>
          805-720-8554
        </p>
      </div>
    `;

    // Send email with attachment
    await sendInvoiceEmail(
      validatedData.to,
      validatedData.subject,
      htmlBody,
      pdfBuffer,
      invoice.invoiceNumber,
      validatedData.cc,
      validatedData.bcc
    );

    // Log the activity
    const allRecipients = [
      validatedData.to,
      validatedData.cc,
      validatedData.bcc
    ].filter(Boolean).join(', ');
    console.log(`Invoice ${invoice.invoiceNumber} sent to ${allRecipients}`);

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send invoice email',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}