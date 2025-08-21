// src/app/dashboard/financials/income/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AddClientDialog } from "@/components/financials/AddClientDialog";
import { NewInvoiceDialog } from "@/components/financials/NewInvoiceDialog";
import EditInvoiceDialog from "@/components/financials/EditInvoiceDialog";
import { Client, Invoice } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Define a more specific type for invoices that include the client relationship
type InvoiceWithClient = Invoice & { client: Client };

// Props for the InvoiceList component now include a selection handler
interface InvoiceListProps {
  invoices: InvoiceWithClient[];
  onInvoiceSelect: (invoice: Invoice) => void;
}

// A component to display the list of invoices
function InvoiceList({ invoices, onInvoiceSelect }: InvoiceListProps) {
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
          // The TableRow is now clickable to trigger the dialog
          <TableRow
            key={invoice.id}
            onClick={() => onInvoiceSelect(invoice)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>
              <Badge variant={invoice.status === "PAID" ? "default" : "secondary"}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
            <TableCell>{invoice.client.name}</TableCell>
            <TableCell className="text-right">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(invoice.amount)}
            </TableCell>
            <TableCell>
              {/* FIXED: Use UTC timezone for consistent date display */}
              {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                timeZone: 'UTC',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ClientList component remains unchanged
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
              <p className="text-sm text-muted-foreground">
                {client.email || "No email provided"}
              </p>
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

  // State for managing the Edit Invoice Dialog
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handler to open the dialog with the selected invoice's data
  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const response = await fetch("/api/financials/clients");
      if (!response.ok) throw new Error("Failed to fetch clients.");
      const data = await response.json();
      data.sort((a: Client, b: Client) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClients(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Error fetching clients", { description: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setIsLoadingInvoices(true);
    try {
      const response = await fetch("/api/financials/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices.");
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Error fetching invoices", { description: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, []);

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
          {!isLoadingInvoices && !error && (
            <InvoiceList invoices={invoices} onInvoiceSelect={handleInvoiceSelect} />
          )}
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

      {/* The Edit Invoice Dialog is now rendered here */}
      <EditInvoiceDialog
        invoice={selectedInvoice}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onInvoiceUpdated={fetchInvoices}
      />
    </div>
  );
}