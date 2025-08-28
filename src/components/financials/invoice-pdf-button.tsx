'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDFExport } from '@/hooks/use-pdf-export';
import { useToast } from '@/hooks/use-toast';

interface InvoicePDFButtonProps {
  invoiceNumber: string;
  className?: string;
}

export function InvoicePDFButton({ 
  invoiceNumber, 
  className 
}: InvoicePDFButtonProps) {
  const { exportToPDF, isGenerating } = usePDFExport();
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await exportToPDF('invoice-content', `invoice-${invoiceNumber}`);
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      className={className}
      variant="outline"
    >
      <Download className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}