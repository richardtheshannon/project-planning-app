"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Client, type ClientContact } from "@prisma/client";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit, Loader2, CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactsField, { ContactItem } from "@/components/financials/ContactsField";

const formSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters."),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  billTo: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  contractStartDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  contacts: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    _action: z.enum(['create', 'update', 'delete']).optional(),
  })).optional(),
});

type FormData = z.infer<typeof formSchema>;
type ClientWithContacts = Client & { contacts?: ClientContact[] };

interface EditClientDialogProps {
  client: ClientWithContacts;
  onClientUpdated: (updatedClient: any) => void;
}

// Helper function to convert null to empty string
const nullToEmpty = (value: string | null | undefined): string => {
  return value ?? "";
};

// Helper function to convert contacts from Prisma to form format
const convertContactsToFormFormat = (contacts: ClientContact[] | undefined): ContactItem[] => {
  if (!contacts || contacts.length === 0) return [];
  
  return contacts.map(contact => ({
    id: contact.id,
    name: contact.name,
    email: contact.email ?? undefined,
    phone: contact.phone ?? undefined,
    note: contact.note ?? undefined,
  }));
};

export default function EditClientDialog({ client, onClientUpdated }: EditClientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      email: nullToEmpty(client.email),
      website: nullToEmpty(client.website),
      billTo: nullToEmpty(client.billTo),
      phone: nullToEmpty(client.phone),
      address1: nullToEmpty(client.address1),
      address2: nullToEmpty(client.address2),
      city: nullToEmpty(client.city),
      state: nullToEmpty(client.state),
      zipCode: nullToEmpty(client.zipCode),
      notes: nullToEmpty(client.notes),
      contractStartDate: client.contractStartDate ? new Date(client.contractStartDate) : null,
      contacts: convertContactsToFormFormat(client.contacts),
    },
  });

  async function onSubmit(values: FormData) {
    try {
      // Convert empty strings back to null for database
      const processedValues = {
        ...values,
        email: values.email || null,
        website: values.website || null,
        billTo: values.billTo || null,
        phone: values.phone || null,
        address1: values.address1 || null,
        address2: values.address2 || null,
        city: values.city || null,
        state: values.state || null,
        zipCode: values.zipCode || null,
        notes: values.notes || null,
      };

      const response = await fetch(`/api/financials/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedValues),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update client';
        throw new Error(errorMessage);
      }

      const updated = await response.json();
      onClientUpdated(updated);
      setIsOpen(false);
      toast({ title: "Success", description: "Client details updated." });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update client.",
        variant: "destructive"
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update the details for this client. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill To</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Client Start Date</FormLabel>
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
                                format(new Date(field.value), "PPP")
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
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="mt-4">
                <FormField
                  control={form.control}
                  name="contacts"
                  render={({ field }) => (
                    <ContactsField 
                      contacts={field.value || []} 
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}