import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function usePDFExport() {
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = useCallback(async (
    elementId: string, 
    fileName: string
  ) => {
    setIsGenerating(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');

      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: false,
      } as any);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { exportToPDF, isGenerating };
}