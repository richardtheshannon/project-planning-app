// src/app/dashboard/financials/income/invoices/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { NewInvoiceDialog } from "@/components/financials/NewInvoiceDialog";
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
import { ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";

// Define a more specific type for invoices that include the client relationship
type InvoiceWithClient = Invoice & { client: Client };

// InvoiceList component
interface InvoiceListProps {
  invoices: InvoiceWithClient[];
}

function InvoiceList({ invoices }: InvoiceListProps) {
  const router = useRouter();

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No invoices yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first invoice to get started
        </p>
      </div>
    );
  }

  const handleInvoiceClick = (invoiceId: string) => {
    router.push(`/dashboard/financials/invoices/${invoiceId}`);
  };

  // Calculate summary statistics
  const stats = invoices.reduce((acc, invoice) => {
    acc.total += invoice.amount;
    if (invoice.status === 'PAID') {
      acc.paid += invoice.amount;
      acc.paidCount++;
    } else if (invoice.status === 'PENDING') {
      acc.pending += invoice.amount;
      acc.pendingCount++;
    } else if (invoice.status === 'OVERDUE') {
      acc.overdue += invoice.amount;
      acc.overdueCount++;
    }
    return acc;
  }, { total: 0, paid: 0, pending: 0, overdue: 0, paidCount: 0, pendingCount: 0, overdueCount: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(stats.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Paid</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(stats.paid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paidCount} {stats.paidCount === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(stats.pending)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCount} {stats.pendingCount === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(stats.overdue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overdueCount} {stats.overdueCount === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const isOverdue = invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date();
              return (
                <TableRow
                  key={invoice.id}
                  onClick={() => handleInvoiceClick(invoice.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Badge 
                      variant={
                        invoice.status === "PAID" ? "default" : 
                        invoice.status === "OVERDUE" || isOverdue ? "destructive" : 
                        "secondary"
                      }
                    >
                      {invoice.status === "PENDING" && isOverdue ? "OVERDUE" : invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.issuedDate).toLocaleDateString('en-US', { 
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoadingInvoices(true);
    setError(null);
    try {
      const response = await fetch("/api/financials/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices.");
      const data = await response.json();
      // Sort by issued date, newest first
      data.sort((a: InvoiceWithClient, b: InvoiceWithClient) => 
        new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
      );
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
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage your invoices and track payment status
          </p>
        </div>
        <NewInvoiceDialog onInvoiceAdded={fetchInvoices} />
      </div>

      {/* Content */}
      {isLoadingInvoices && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading invoices...</p>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-destructive">Failed to fetch invoices: {error}</p>
          </CardContent>
        </Card>
      )}
      
      {!isLoadingInvoices && !error && (
        <InvoiceList invoices={invoices} />
      )}
    </div>
  );
}