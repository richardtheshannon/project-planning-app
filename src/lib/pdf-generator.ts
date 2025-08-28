import jsPDF from 'jspdf';
import { Invoice, Client, LineItem } from '@prisma/client';

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

  // Set fonts and colors
  pdf.setFontSize(24);
  pdf.setTextColor(0, 128, 0);
  pdf.text('SALESFIELD NETWORK', 105, 30, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', 105, 45, { align: 'center' });
  
  // Invoice details
  pdf.setFontSize(10);
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 60);
  pdf.text(`Date: ${new Date(invoice.issuedDate).toLocaleDateString()}`, 20, 67);
  pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 74);
  
  // Company info
  pdf.setFontSize(12);
  pdf.text('From:', 20, 90);
  pdf.setFontSize(10);
  pdf.text('SalesField Network', 20, 97);
  pdf.text('Richard Shannon', 20, 104);
  pdf.text('263 Dairyland Rd', 20, 111);
  pdf.text('Buellton, CA 93427', 20, 118);
  pdf.text('richard@salesfield.net', 20, 125);
  pdf.text('P: 805-720-8554', 20, 132);
  
  // Bill To
  if (invoice.client) {
    pdf.setFontSize(12);
    pdf.text('Bill To:', 120, 90);
    pdf.setFontSize(10);
    pdf.text(invoice.client.name, 120, 97);
    if (invoice.client.billTo) {
      pdf.text(invoice.client.billTo, 120, 104);
    }
    if (invoice.client.email) {
      pdf.text(invoice.client.email, 120, 111);
    }
    if (invoice.client.phone) {
      pdf.text(invoice.client.phone, 120, 118);
    }
    if (invoice.client.address1) {
      pdf.text(invoice.client.address1, 120, 125);
      if (invoice.client.address2) {
        pdf.text(invoice.client.address2, 120, 132);
      }
      const cityStateZip = [
        invoice.client.city,
        invoice.client.state,
        invoice.client.zipCode
      ].filter(Boolean).join(' ');
      if (cityStateZip) {
        pdf.text(cityStateZip, 120, invoice.client.address2 ? 139 : 132);
      }
    }
  }
  
  // Line items table
  let yPosition = 150;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Date', 20, yPosition);
  pdf.text('Description', 50, yPosition);
  pdf.text('Amount', 170, yPosition);
  
  pdf.line(20, yPosition + 2, 190, yPosition + 2);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  invoice.lineItems.forEach((item) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    const date = new Date(item.date).toLocaleDateString();
    pdf.text(date, 20, yPosition);
    
    // Handle long descriptions
    const description = item.description || '';
    const lines = pdf.splitTextToSize(description, 100);
    pdf.text(lines, 50, yPosition);
    
    pdf.text(`$${item.amount.toFixed(2)}`, 170, yPosition);
    yPosition += 7 * Math.max(lines.length, 1);
  });
  
  // Totals
  pdf.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Subtotal:', 140, yPosition);
  pdf.text(`$${invoice.amount.toFixed(2)}`, 170, yPosition);
  yPosition += 7;
  
  pdf.text('Total Due:', 140, yPosition);
  pdf.text(`$${invoice.amount.toFixed(2)}`, 170, yPosition);
  
  // Payment instructions
  yPosition += 20;
  if (yPosition < 250) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Instructions', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    yPosition += 7;
    pdf.text('Please make all checks payable to:', 20, yPosition);
    yPosition += 5;
    pdf.text('Richard Shannon', 20, yPosition);
    yPosition += 5;
    pdf.text('263 Dairyland Rd', 20, yPosition);
    yPosition += 5;
    pdf.text('Buellton, CA 93427', 20, yPosition);
  }
  
  // Convert to Buffer
  const pdfOutput = pdf.output('arraybuffer');
  return Buffer.from(pdfOutput);
}