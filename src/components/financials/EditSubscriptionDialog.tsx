// src/components/financials/EditSubscriptionDialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Subscription, BillingCycle } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// Props for the component
interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionUpdated: () => void;
}

// ✅ STEP 1: Update Zod schema to include the optional dueDate
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  amount: z.number().min(0.01, "Amount must be a positive number."),
  billingCycle: z.nativeEnum(BillingCycle),
  dueDate: z.date().optional(),
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
      billingCycle: BillingCycle.MONTHLY,
      dueDate: undefined,
    },
  });

  // ✅ STEP 2: Watch the billingCycle field to conditionally render the date picker
  const billingCycle = form.watch("billingCycle");

  // Effect to reset the form when the selected subscription changes
  useEffect(() => {
    if (subscription) {
      // ✅ STEP 3: Update form reset to include the new dueDate field
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        billingCycle: subscription.billingCycle,
        dueDate: subscription.dueDate ? new Date(subscription.dueDate) : undefined,
      });
    }
  }, [subscription, form]);

  // Handler for form submission to update a subscription
  const onSubmit = async (values: FieldValues) => {
    if (!subscription) return;

    // ✅ STEP 4: Update the payload to conditionally include dueDate
    // If the cycle is monthly, we explicitly set dueDate to null.
    const bodyPayload = {
        name: values.name,
        amount: parseFloat(values.amount),
        billingCycle: values.billingCycle,
        dueDate: values.billingCycle === BillingCycle.ANNUALLY ? values.dueDate : null,
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
                      <SelectItem value={BillingCycle.MONTHLY}>Monthly</SelectItem>
                      <SelectItem value={BillingCycle.ANNUALLY}>Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* ✅ STEP 5: Conditionally render the Due Date picker */}
            {billingCycle === BillingCycle.ANNUALLY && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4 flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this
                      subscription from your records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
