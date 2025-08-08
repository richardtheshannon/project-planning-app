"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddClientDialog } from "@/components/financials/AddClientDialog";
import { NewInvoiceDialog } from "@/components/financials/NewInvoiceDialog";
import { Client, Invoice } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Define a more specific type for invoices that include the client relationship
type InvoiceWithClient = Invoice & { client: Client };

// A component to display the list of invoices
function InvoiceList({ invoices }: { invoices: InvoiceWithClient[] }) {
    if (invoices.length === 0) {
        return (
          <p className="py-4 text-center text-sm text-muted-foreground">
            You haven't created any invoices yet.
          </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                        <TableCell>
                            <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'}>
                                {invoice.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client.name}</TableCell>
                        <TableCell className="text-right">
                            {/* Assuming invoice.amount is a number */}
                            ${(invoice.amount as number).toFixed(2)}
                        </TableCell>
                        <TableCell>{format(new Date(invoice.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


// REVISED: ClientList component now uses Link to make items clickable
function ClientList({ clients }: { clients: Client[] }) {
    if (clients.length === 0) {
      return (
        <p className="py-4 text-center text-sm text-muted-foreground">
          You haven't added any clients yet.
        </p>
      );
    }
  
    return (
      <div className="divide-y rounded-md border">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/dashboard/financials/clients/${client.id}`}
            className="block transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email || 'No email provided'}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    );
  }
  
  export default function IncomePage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Function to fetch clients from the API
    const fetchClients = useCallback(async () => {
      setIsLoadingClients(true);
      setError(null);
      try {
        const response = await fetch('/api/financials/clients');
        if (!response.ok) throw new Error('Failed to fetch clients.');
        const data = await response.json();
        // Sort clients by creation date on the client side
        data.sort((a: Client, b: Client) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setClients(data);
      } catch (err) {
        toast({
          title: "Error fetching clients",
          description: err instanceof Error ? err.message : "An unknown error occurred.",
          variant: "destructive",
        });
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoadingClients(false);
      }
    }, []);
  
    // Function to fetch invoices from the API
    const fetchInvoices = useCallback(async () => {
      setIsLoadingInvoices(true);
      setError(null);
      try {
          const response = await fetch('/api/financials/invoices');
          if (!response.ok) throw new Error('Failed to fetch invoices.');
          const data = await response.json();
          setInvoices(data);
      } catch (err) {
          toast({
              title: "Error fetching invoices",
              description: err instanceof Error ? err.message : "An unknown error occurred.",
              variant: "destructive",
          });
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching invoices.");
      } finally {
          setIsLoadingInvoices(false);
      }
    }, []);
  
  
    // Fetch initial data when the component mounts
    useEffect(() => {
      fetchClients();
      fetchInvoices();
    }, [fetchClients, fetchInvoices]);
  
    return (
      <div className="space-y-8">
        {/* Section: Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Track your invoices and their payment status.
              </CardDescription>
            </div>
            <NewInvoiceDialog onInvoiceAdded={fetchInvoices} />
          </CardHeader>
          <CardContent>
            {isLoadingInvoices && <p className="text-muted-foreground">Loading invoices...</p>}
            {error && <p className="text-destructive">Failed to fetch invoices.</p>}
            {!isLoadingInvoices && !error && <InvoiceList invoices={invoices} />}
          </CardContent>
        </Card>
  
        {/* Section: Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                Manage your clients and view their lifetime value.
              </CardDescription>
            </div>
            <AddClientDialog onClientAdded={fetchClients} />
          </CardHeader>
          <CardContent>
            {isLoadingClients && <p className="text-muted-foreground">Loading clients...</p>}
            {error && <p className="text-destructive">Failed to fetch clients.</p>}
            {!isLoadingClients && !error && <ClientList clients={clients} />}
          </CardContent>
        </Card>
      </div>
    );
  }
  
