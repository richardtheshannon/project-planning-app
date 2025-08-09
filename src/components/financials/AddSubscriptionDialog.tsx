"use client";

import { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus } from "lucide-react";
import { BillingCycle } from "@prisma/client";
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
import { toast } from "sonner";

// ✅ STEP 1: Update Zod schema to include optional dueDate and use z.number() for amount
const formSchema = z.object({
  name: z.string().min(1, { message: "Subscription name is required." }),
  amount: z.number().min(0.01, "Amount must be a positive number."),
  billingCycle: z.nativeEnum(BillingCycle),
  dueDate: z.date().optional(),
});

type SubscriptionFormValues = z.infer<typeof formSchema>;

interface AddSubscriptionDialogProps {
  onSubscriptionAdded: () => void;
}

export function AddSubscriptionDialog({ onSubscriptionAdded }: AddSubscriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ STEP 2: Update default form values
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      billingCycle: BillingCycle.MONTHLY,
      dueDate: undefined,
    },
  });

  // ✅ STEP 3: Watch the billingCycle field
  const billingCycle = form.watch("billingCycle");

  async function onSubmit(values: FieldValues) {
    // ✅ STEP 4: Update the payload to handle the new fields
    const payload = {
      name: values.name,
      amount: parseFloat(values.amount),
      billingCycle: values.billingCycle,
      dueDate: values.billingCycle === BillingCycle.ANNUALLY ? values.dueDate : null,
    };

    try {
      const response = await fetch('/api/financials/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add subscription');
      }

      toast.success("Subscription added successfully!");
      form.reset();
      onSubscriptionAdded();
      setIsOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(errorMessage);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
          <DialogDescription>
            Fill out the details for the recurring subscription.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Adobe Creative Cloud" {...field} />
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
                    {/* ✅ STEP 5: Update Input to handle parseFloat */}
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* ✅ STEP 6: Conditionally render the Due Date picker */}
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
            
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
