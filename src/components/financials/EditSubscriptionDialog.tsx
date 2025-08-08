// src/components/financials/EditSubscriptionDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Subscription } from "@prisma/client";

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
interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionUpdated: () => void;
}

// Define billing cycle options for the form
const billingCycles = ["MONTHLY", "ANNUALLY"];

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  amount: z.number().min(0.01, "Amount must be a positive number."),
  billingCycle: z.string().min(1, "Billing cycle is required."),
  nextPaymentDate: z.string().min(1, "Next payment date is required."),
});

type SubscriptionFormValues = z.infer<typeof formSchema>;

export default function EditSubscriptionDialog({
  subscription,
  isOpen,
  onOpenChange,
  onSubscriptionUpdated,
}: EditSubscriptionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      billingCycle: "MONTHLY",
      nextPaymentDate: "",
    },
  });

  // Effect to reset the form when the selected subscription changes
  useEffect(() => {
    if (subscription) {
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        billingCycle: subscription.billingCycle,
        nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString().split("T")[0],
      });
    }
  }, [subscription, form]);

  // Handler for form submission to update a subscription
  const onSubmit = async (values: FieldValues) => {
    if (!subscription) return;

    const bodyPayload = {
        ...values,
        amount: parseFloat(values.amount),
        nextPaymentDate: new Date(values.nextPaymentDate).toISOString(),
    };

    try {
      const response = await fetch(`/api/financials/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription.");
      }

      toast.success("Subscription updated successfully!");
      onSubscriptionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the subscription.");
    }
  };

  // Handler for deleting a subscription
  const handleDelete = async () => {
    if (!subscription) return;

    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/financials/subscriptions/${subscription.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription.");
      }

      toast.success("Subscription deleted successfully!");
      onSubscriptionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the subscription.");
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
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Make changes to your subscription here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billingCycles.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle.charAt(0).toUpperCase() + cycle.slice(1).toLowerCase()}
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
              name="nextPaymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Payment Date</FormLabel>
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
