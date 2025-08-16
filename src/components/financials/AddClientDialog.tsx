"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Loader2, CalendarIcon } from "lucide-react";

// ✅ NEW: Helper function to correct for timezone offset from date inputs
const adjustDateForTimezone = (date: Date): Date => {
  const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(date.getTime() + timezoneOffset);
};

// Define the form schema with the new frequency field
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  contractStartDate: z.date().optional().nullable(),
  contractTerm: z.string(),
  frequency: z.string().optional(),
  contractAmount: z.number().positive("Amount must be a positive number.").optional().nullable(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddClientDialogProps {
  onClientAdded: () => void;
}

export function AddClientDialog({ onClientAdded }: AddClientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      website: "",
      notes: "",
      contractTerm: "ONE_TIME",
      frequency: "One-Time",
      contractAmount: null,
      contractStartDate: null,
    },
  });

  async function onSubmit(values: FormData) {
    try {
      // ✅ MODIFIED: Use the timezone adjustment helper for the contractStartDate
      const bodyPayload = {
        ...values,
        contractStartDate: values.contractStartDate ? adjustDateForTimezone(values.contractStartDate) : null,
      };

      const response = await fetch('/api/financials/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      toast({ title: "Success", description: "New client has been added." });
      form.reset();
      onClientAdded();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not create client.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details for your new client. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Acme Corporation" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., contact@acme.com" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://acme.com" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contractStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Contract Start Date</FormLabel>
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
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="contractTerm"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contract Terms</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ONE_MONTH">1 Month</SelectItem>
                                    <SelectItem value="THREE_MONTH">3 Month</SelectItem>
                                    <SelectItem value="SIX_MONTH">6 Month</SelectItem>
                                    <SelectItem value="ONE_YEAR">1 Year</SelectItem>
                                    <SelectItem value="ONE_TIME">One-Time</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="One-Time">One-Time</SelectItem>
                          <SelectItem value="1 Month">1 Month</SelectItem>
                          <SelectItem value="3 Month">3 Month</SelectItem>
                          <SelectItem value="6 Month">6 Month</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contractAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 1500"
                          {...field}
                          value={field.value ?? ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? null : parseFloat(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any relevant notes about this client..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Client
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
