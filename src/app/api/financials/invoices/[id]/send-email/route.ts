import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { sendInvoiceEmail } from '@/lib/google-email';
import { z } from 'zod';

const emailSchema = z.object({
  to: z.string().email(),
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
      invoice.invoiceNumber
    );

    // Log the activity
    console.log(`Invoice ${invoice.invoiceNumber} sent to ${validatedData.to}`);

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}