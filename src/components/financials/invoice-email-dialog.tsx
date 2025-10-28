'use client';

import { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface InvoiceEmailDialogProps {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail?: string;
  clientName?: string;
  amount: number;
  dueDate: Date;
}

export function InvoiceEmailDialog({
  invoiceId,
  invoiceNumber,
  clientEmail = '',
  clientName = '',
  amount,
  dueDate,
}: InvoiceEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const [emailData, setEmailData] = useState({
    to: clientEmail,
    cc: '',
    bcc: '',
    subject: `Invoice ${invoiceNumber} from SalesField Network`,
    message: `Dear ${clientName || 'Valued Client'},

I hope this email finds you well.

Please find attached Invoice ${invoiceNumber} for $${amount.toFixed(2)}, due on ${new Date(dueDate).toLocaleDateString()}.

If you have any questions or concerns regarding this invoice, please don't hesitate to reach out.

Thank you for your business!

Best regards,
Richard Shannon
SalesField Network`,
  });

  const handleSend = async () => {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `/api/financials/invoices/${invoiceId}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error || 'Failed to send email';
        console.error('API Error Response:', result);
        throw new Error(errorMessage);
      }

      toast({
        title: 'Success',
        description: 'Invoice email sent successfully',
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to send email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      console.error('Error details:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Send Email
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Invoice Email</DialogTitle>
            <DialogDescription>
              Send invoice {invoiceNumber} as a PDF attachment
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="to">To Email *</Label>
              <Input
                id="to"
                type="text"
                placeholder="recipient@example.com, another@example.com"
                value={emailData.to}
                onChange={(e) =>
                  setEmailData({ ...emailData, to: e.target.value })
                }
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple emails with commas
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cc">CC (Optional)</Label>
              <Input
                id="cc"
                type="text"
                placeholder="cc@example.com, another@example.com"
                value={emailData.cc}
                onChange={(e) =>
                  setEmailData({ ...emailData, cc: e.target.value })
                }
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Carbon copy - recipients can see each other
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bcc">BCC (Optional)</Label>
              <Input
                id="bcc"
                type="text"
                placeholder="bcc@example.com, another@example.com"
                value={emailData.bcc}
                onChange={(e) =>
                  setEmailData({ ...emailData, bcc: e.target.value })
                }
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Blind carbon copy - recipients are hidden from others
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
                disabled={sending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                rows={10}
                value={emailData.message}
                onChange={(e) =>
                  setEmailData({ ...emailData, message: e.target.value })
                }
                disabled={sending}
                className="font-mono text-sm"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              * Invoice will be attached as PDF
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}