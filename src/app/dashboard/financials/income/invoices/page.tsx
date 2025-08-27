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
import { ChevronRight, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

// Define a more specific type for invoices that include the client relationship
type InvoiceWithClient = Invoice & { client: Client };

// InvoiceList component
interface InvoiceListProps {
  invoices: InvoiceWithClient[];
}

// Define sortable columns and their types
type SortableColumn = 'status' | 'invoiceNumber' | 'clientName' | 'amount' | 'issuedDate' | 'dueDate';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: SortableColumn | null;
  direction: SortDirection;
}

function InvoiceList({ invoices }: InvoiceListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [filteredAndSortedInvoices, setFilteredAndSortedInvoices] = useState<InvoiceWithClient[]>(invoices);

  // Filter and sort invoices
  useEffect(() => {
    let result = [...invoices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice => {
        const matchesInvoiceNumber = invoice.invoiceNumber.toLowerCase().includes(query);
        const matchesClientName = invoice.client.name.toLowerCase().includes(query);
        const matchesStatus = invoice.status.toLowerCase().includes(query);
        const matchesAmount = invoice.amount.toString().includes(query);
        const matchesIssuedDate = new Date(invoice.issuedDate).toLocaleDateString('en-US').toLowerCase().includes(query);
        const matchesDueDate = new Date(invoice.dueDate).toLocaleDateString('en-US').toLowerCase().includes(query);
        
        return matchesInvoiceNumber || matchesClientName || matchesStatus || matchesAmount || matchesIssuedDate || matchesDueDate;
      });
    }

    // Apply sorting
    if (sortState.column && sortState.direction) {
      result.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortState.column) {
          case 'status':
            valueA = a.status;
            valueB = b.status;
            break;
          case 'invoiceNumber':
            valueA = a.invoiceNumber;
            valueB = b.invoiceNumber;
            break;
          case 'clientName':
            valueA = a.client.name;
            valueB = b.client.name;
            break;
          case 'amount':
            valueA = a.amount;
            valueB = b.amount;
            break;
          case 'issuedDate':
            valueA = new Date(a.issuedDate);
            valueB = new Date(b.issuedDate);
            break;
          case 'dueDate':
            valueA = new Date(a.dueDate);
            valueB = new Date(b.dueDate);
            break;
          default:
            return 0;
        }

        // Handle different data types
        if (valueA < valueB) {
          return sortState.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortState.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredAndSortedInvoices(result);
  }, [invoices, searchQuery, sortState]);

  // Handle column sort
  const handleSort = (column: SortableColumn) => {
    setSortState(prevState => {
      if (prevState.column === column) {
        // Cycle through: asc -> desc -> null
        const direction = prevState.direction === 'asc' ? 'desc' : prevState.direction === 'desc' ? null : 'asc';
        return { column: direction ? column : null, direction };
      }
      // New column, start with ascending
      return { column, direction: 'asc' };
    });
  };

  // Get sort icon for column
  const getSortIcon = (column: SortableColumn) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    }
    if (sortState.direction === 'asc') {
      return <ArrowUp className="h-3 w-3 text-muted-foreground" />;
    }
    if (sortState.direction === 'desc') {
      return <ArrowDown className="h-3 w-3 text-muted-foreground" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
  };

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

  if (filteredAndSortedInvoices.length === 0 && searchQuery) {
    return (
      <div className="space-y-6">
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No invoices found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search terms
          </p>
        </div>
      </div>
    );
  }

  const handleInvoiceClick = (invoiceId: string) => {
    router.push(`/dashboard/financials/invoices/${invoiceId}`);
  };

  // Calculate summary statistics using filtered data
  const stats = filteredAndSortedInvoices.reduce((acc, invoice) => {
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
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

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
              {filteredAndSortedInvoices.length} {filteredAndSortedInvoices.length === 1 ? 'invoice' : 'invoices'}{searchQuery && ` (filtered from ${invoices.length})`}
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
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span>Invoice #</span>
                  {getSortIcon('invoiceNumber')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Client</span>
                  {getSortIcon('clientName')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('issuedDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Issue Date</span>
                  {getSortIcon('issuedDate')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </div>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedInvoices.map((invoice) => {
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