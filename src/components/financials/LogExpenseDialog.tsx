"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Upload } from "lucide-react";
import { ExpenseCategory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// ✅ 1. Update Zod schema to include an optional file
const formSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  category: z.nativeEnum(ExpenseCategory),
  date: z.string().min(1, { message: "Please select a date." }),
  // The receipt is optional
  receipt: z.instanceof(File).optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface LogExpenseDialogProps {
  onExpenseAdded: () => void;
}

export function LogExpenseDialog({ onExpenseAdded }: LogExpenseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultFormValues: Partial<ExpenseFormValues> = {
    description: "",
    amount: "",
    category: ExpenseCategory.OTHER,
    date: "",
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // ✅ 2. Rewrite the submit handler to manage a two-step process
  async function onSubmit(values: ExpenseFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // --- Step 1: Create the Expense record ---
      const expensePayload = {
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        date: new Date(values.date),
      };

      const expenseResponse = await fetch('/api/financials/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensePayload),
      });

      if (!expenseResponse.ok) {
        const errorData = await expenseResponse.json();
        throw new Error(errorData.error || 'Failed to log expense');
      }
      
      const newExpense = await expenseResponse.json();

      // --- Step 2: If a receipt exists, upload it and link it to the new expense ---
      if (values.receipt && values.receipt.size > 0) {
        const formData = new FormData();
        formData.append('file', values.receipt);
        // Use the expense description as the document title for convenience
        formData.append('title', `Receipt for: ${values.description}`);
        formData.append('expenseId', newExpense.id); // Link to the new expense

        const documentResponse = await fetch('/api/documents', {
            method: 'POST',
            body: formData,
            // Note: No 'Content-Type' header, the browser sets it for FormData
        });

        if (!documentResponse.ok) {
            // Even if the doc fails, the expense was created. We can inform the user.
            throw new Error('Expense was created, but receipt upload failed.');
        }
      }

      // --- Success ---
      form.reset(defaultFormValues);
      onExpenseAdded(); // Refresh the parent component's data
      setIsOpen(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log New Expense</DialogTitle>
          <DialogDescription>
            Fill out the details below and optionally upload a receipt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Note: We no longer need the <form> tag here as react-hook-form handles it */}
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office lunch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ExpenseCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ✅ 3. Add the new File Upload field */}
            <FormField
              control={form.control}
              name="receipt"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Receipt (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      {...rest}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        onChange(file);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
