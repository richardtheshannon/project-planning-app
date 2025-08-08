// src/components/financials/EditExpenseDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Expense, ExpenseCategory } from "@prisma/client";

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
interface EditExpenseDialogProps {
  expense: Expense | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdated: () => void;
}

// Zod schema for form validation
const formSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.number().min(0.01, "Amount must be a positive number."),
  category: z.nativeEnum(ExpenseCategory),
  date: z.string().min(1, "Date is required."),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

export default function EditExpenseDialog({
  expense,
  isOpen,
  onOpenChange,
  onExpenseUpdated,
}: EditExpenseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: ExpenseCategory.OTHER,
      date: "",
    },
  });

  // Effect to reset the form when the selected expense changes
  useEffect(() => {
    if (expense) {
      form.reset({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().split("T")[0],
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        category: ExpenseCategory.OTHER,
        date: "",
      });
    }
  }, [expense, form]);

  // Handler for form submission to update an expense
  const onSubmit = async (values: FieldValues) => {
    if (!expense) return;

    const bodyPayload = {
      description: values.description,
      amount: parseFloat(values.amount),
      category: values.category,
      date: new Date(values.date).toISOString(),
    };

    try {
      const response = await fetch(`/api/financials/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense.");
      }

      toast.success("Expense updated successfully!");
      onExpenseUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the expense.");
    }
  };

  // Handler for deleting an expense
  const handleDelete = async () => {
    if (!expense) return;

    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/financials/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense.");
      }

      toast.success("Expense deleted successfully!");
      onExpenseUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the expense.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to your expense here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ExpenseCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
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
