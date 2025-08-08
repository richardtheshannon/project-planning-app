// src/components/financials/EditInvoiceDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Invoice, InvoiceStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Props for the component
interface EditInvoiceDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated: () => void;
}

// Zod schema for form validation.
const formSchema = z.object({
  amount: z.number().min(0.01, "Amount must be a positive number."),
  status: z.nativeEnum(InvoiceStatus),
  issuedDate: z.string().min(1, "Issued date is required."),
  dueDate: z.string().min(1, "Due date is required."),
});

// Explicitly define the type for our form values from the schema
type InvoiceFormValues = z.infer<typeof formSchema>;

export default function EditInvoiceDialog({
  invoice,
  isOpen,
  onOpenChange,
  onInvoiceUpdated,
}: EditInvoiceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize the form with react-hook-form, explicitly providing the type
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      status: InvoiceStatus.PENDING,
      issuedDate: "",
      dueDate: "",
    },
  });

  // This effect runs when the 'invoice' prop changes.
  // It resets the form with the new invoice's data.
  useEffect(() => {
    if (invoice) {
      form.reset({
        amount: invoice.amount,
        status: invoice.status,
        // Dates need to be formatted as YYYY-MM-DD for the input[type="date"]
        issuedDate: new Date(invoice.issuedDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
      });
    } else {
      // If no invoice is selected (e.g., dialog is closed), reset to defaults
      form.reset({
        amount: 0,
        status: InvoiceStatus.PENDING,
        issuedDate: "",
        dueDate: "",
      });
    }
  }, [invoice, form]);

  // Handler for form submission to update an invoice
  const onSubmit = async (values: FieldValues) => {
    if (!invoice) return;

    try {
      // CORRECTED: Construct the body payload directly to avoid type inference issues.
      const bodyPayload = {
        amount: parseFloat(values.amount),
        status: values.status,
        issuedDate: new Date(values.issuedDate).toISOString(),
        dueDate: new Date(values.dueDate).toISOString(),
      };

      const response = await fetch(`/api/financials/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice.");
      }

      toast.success("Invoice updated successfully!");
      onInvoiceUpdated(); // Refresh the data on the parent page
      onOpenChange(false); // Close the dialog
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the invoice.");
    }
  };

  // Handler for deleting an invoice
  const handleDelete = async () => {
    if (!invoice) return;

    // A simple confirmation dialog
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
        return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/financials/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice.");
      }

      toast.success("Invoice deleted successfully!");
      onInvoiceUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the invoice.");
    } finally {
        setIsDeleting(false);
    }
  };
  
  // We don't render anything if the dialog isn't open
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Make changes to the invoice here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(InvoiceStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issuedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issued Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
