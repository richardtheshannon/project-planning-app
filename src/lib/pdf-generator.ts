import jsPDF from 'jspdf';
import { Invoice, Client, LineItem } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export interface InvoiceWithDetails extends Invoice {
  client: Client | null;
  lineItems: LineItem[];
}

export async function generateInvoicePDF(
  invoice: InvoiceWithDetails
): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set up margins
  const leftMargin = 20;
  const rightMargin = 190;
  const pageWidth = 210;
  
  // Load logo dynamically from file system
  let logoBase64: string | null = null;
  try {
    // Try multiple possible logo paths
    const possiblePaths = [
      path.join(process.cwd(), 'public/media/hoiz-logo-title-subtitle-01.png'),
      path.join(process.cwd(), 'public/media/salesfield-logo.png'),
      path.join(process.cwd(), 'public/media/logo.png'),
      path.join(process.cwd(), 'public/salesfield-logo.png'),
    ];
    
    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        console.log(`Logo loaded from: ${logoPath}`);
        break;
      }
    }
    
    if (!logoBase64) {
      console.warn('Logo file not found in expected locations');
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Add logo if successfully loaded
  if (logoBase64) {
    try {
      // Use proper aspect ratio for horizontal logo
      // Your logo is approximately 5:1 ratio (width:height)
      const logoWidth = 50;  // Increased width for horizontal logo
      const logoHeight = 10; // Proportional height
      pdf.addImage(logoBase64, 'PNG', leftMargin, 15, logoWidth, logoHeight);
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
    }
  }

  // Invoice header - right aligned
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', rightMargin, 25, { align: 'right' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.invoiceNumber, rightMargin, 32, { align: 'right' });
  
  // Add DRAFT watermark if invoice is draft
  if (invoice.status === 'DRAFT') {
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('DRAFT', rightMargin, 38, { align: 'right' });
    pdf.setTextColor(0, 0, 0);
  }

  // Company info - left side
  let yPos = 50;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SalesField Network', leftMargin, yPos);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  yPos += 6;
  pdf.text('Richard Shannon', leftMargin, yPos);
  yPos += 5;
  pdf.text('263 Dairyland Rd', leftMargin, yPos);
  yPos += 5;
  pdf.text('Buellton, CA 93427', leftMargin, yPos);
  yPos += 5;
  pdf.text('richard@salesfield.net', leftMargin, yPos);
  yPos += 5;
  pdf.text('P: 805-720-8554', leftMargin, yPos);

  // Invoice details - right side box
  const boxX = 130;
  const boxY = 55;
  const boxWidth = 60;
  const boxHeight = 25;
  
  // Draw box for invoice details
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(boxX, boxY, boxWidth, boxHeight);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE DETAILS', boxX + boxWidth/2, boxY - 2, { align: 'center' });
  
  pdf.setFont('helvetica', 'normal');
  let detailY = boxY + 7;
  pdf.text('Issue Date:', boxX + 3, detailY);
  pdf.text(new Date(invoice.issuedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }), rightMargin - 3, detailY, { align: 'right' });
  
  detailY += 6;
  pdf.text('Due Date:', boxX + 3, detailY);
  pdf.text(new Date(invoice.dueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }), rightMargin - 3, detailY, { align: 'right' });
  
  detailY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Due:', boxX + 3, detailY);
  pdf.setFontSize(11);
  pdf.text(`$${invoice.amount.toFixed(2)}`, rightMargin - 3, detailY, { align: 'right' });

  // Bill To section
  yPos = 95;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(80, 80, 80);
  pdf.text('BILL TO', leftMargin, yPos);
  pdf.setTextColor(0, 0, 0);
  
  yPos += 7;
  if (invoice.client) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoice.client.name, leftMargin, yPos);
    pdf.setFont('helvetica', 'normal');
    
    if (invoice.client.billTo) {
      yPos += 5;
      pdf.text(invoice.client.billTo, leftMargin, yPos);
    }
    
    // Display address using the new address fields
    if (invoice.client.address1) {
      yPos += 5;
      pdf.text(invoice.client.address1, leftMargin, yPos);
    }
    
    if (invoice.client.address2) {
      yPos += 5;
      pdf.text(invoice.client.address2, leftMargin, yPos);
    }
    
    if (invoice.client.city || invoice.client.state || invoice.client.zipCode) {
      yPos += 5;
      const cityStateZip = [
        invoice.client.city,
        invoice.client.state,
        invoice.client.zipCode
      ].filter(Boolean).join(' ');
      if (cityStateZip) {
        pdf.text(cityStateZip, leftMargin, yPos);
      }
    }
    
    if (invoice.client.email) {
      yPos += 5;
      pdf.text(invoice.client.email, leftMargin, yPos);
    }
    
    if (invoice.client.phone) {
      yPos += 5;
      pdf.text(invoice.client.phone, leftMargin, yPos);
    }
  }

  // Line items table
  yPos = 145;
  
  // Table header
  pdf.setFillColor(245, 245, 245);
  pdf.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 8, 'F');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date', leftMargin + 2, yPos);
  pdf.text('Description', leftMargin + 35, yPos);
  pdf.text('Amount', rightMargin - 2, yPos, { align: 'right' });
  
  // Draw line under header
  yPos += 3;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(leftMargin, yPos, rightMargin, yPos);
  
  // Table rows
  yPos += 7;
  pdf.setFont('helvetica', 'normal');
  
  invoice.lineItems.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > 250) {
      pdf.addPage();
      yPos = 30;
      
      // Redraw table header on new page
      pdf.setFillColor(245, 245, 245);
      pdf.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date', leftMargin + 2, yPos);
      pdf.text('Description', leftMargin + 35, yPos);
      pdf.text('Amount', rightMargin - 2, yPos, { align: 'right' });
      pdf.line(leftMargin, yPos + 3, rightMargin, yPos + 3);
      yPos += 10;
      pdf.setFont('helvetica', 'normal');
    }
    
    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 7, 'F');
    }
    
    // Date
    const date = new Date(item.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    pdf.text(date, leftMargin + 2, yPos);
    
    // Description (handle long text)
    const description = item.description || '';
    const lines = pdf.splitTextToSize(description, 100);
    pdf.text(lines, leftMargin + 35, yPos);
    
    // Amount
    pdf.text(`$${item.amount.toFixed(2)}`, rightMargin - 2, yPos, { align: 'right' });
    
    yPos += 7 * Math.max(lines.length, 1);
  });

  // Totals section
  yPos += 5;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(leftMargin, yPos, rightMargin, yPos);
  yPos += 10;
  
  // Subtotal
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', rightMargin - 40, yPos);
  pdf.text(`$${invoice.amount.toFixed(2)}`, rightMargin - 2, yPos, { align: 'right' });
  
  // Total Due
  yPos += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Total Due:', rightMargin - 40, yPos);
  pdf.text(`$${invoice.amount.toFixed(2)}`, rightMargin - 2, yPos, { align: 'right' });

  // Payment Instructions footer
  yPos += 25;
  if (yPos < 240) {
    // Draw box around payment instructions
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(leftMargin, yPos - 5, rightMargin - leftMargin, 35, 'FD');
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Instructions', leftMargin + 3, yPos);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    yPos += 6;
    pdf.text('Please make all checks payable to:', leftMargin + 3, yPos);
    yPos += 5;
    pdf.text('Richard Shannon', leftMargin + 3, yPos);
    yPos += 5;
    pdf.text('263 Dairyland Rd', leftMargin + 3, yPos);
    yPos += 5;
    pdf.text('Buellton, CA 93427', leftMargin + 3, yPos);
    
    // Add small logo at bottom right if available
    if (logoBase64) {
      try {
        // Maintain aspect ratio for footer logo
        const footerLogoWidth = 30;  // Smaller for footer
        const footerLogoHeight = 6;  // Maintain ~5:1 ratio
        pdf.addImage(logoBase64, 'PNG', rightMargin - footerLogoWidth - 5, yPos - 12, footerLogoWidth, footerLogoHeight);
      } catch (error) {
        // Logo failed, continue without it
      }
    }
  }
  
  // Convert to Buffer
  const pdfOutput = pdf.output('arraybuffer');
  return Buffer.from(pdfOutput);
}