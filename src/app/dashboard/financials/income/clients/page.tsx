// src/app/dashboard/financials/income/clients/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddClientDialog } from "@/components/financials/AddClientDialog";
import { Client, Invoice } from "@prisma/client";
import { 
  ChevronRight, 
  Search, 
  UserCheck, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Users
} from "lucide-react";
import { toast } from "sonner";

// Define type for client with invoices
type ClientWithInvoices = Client & { 
  invoices: Invoice[];
  _count?: {
    invoices: number;
  };
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithInvoices[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithInvoices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/financials/clients");
      if (!response.ok) throw new Error("Failed to fetch clients.");
      const data = await response.json();
      
      // Sort by creation date, newest first
      data.sort((a: Client, b: Client) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Error fetching clients", { description: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle search
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.billTo?.toLowerCase().includes(query) ||
        client.phone?.includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleClientClick = (clientId: string) => {
    router.push(`/dashboard/financials/income/clients/${clientId}`);
  };

  // Calculate statistics
  const stats = clients.reduce((acc, client) => {
    const clientTotal = client.invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    const paidAmount = client.invoices?.filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0) || 0;
    
    acc.totalRevenue += clientTotal;
    acc.paidRevenue += paidAmount;
    acc.activeClients += client.invoices && client.invoices.length > 0 ? 1 : 0;
    
    return acc;
  }, { totalRevenue: 0, paidRevenue: 0, activeClients: 0 });

  const getContractBadgeVariant = (term: string) => {
    switch(term) {
      case 'MONTHLY':
      case 'QUARTERLY':
      case 'ANNUAL':
        return 'default';
      case 'ONE_TIME':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatContractTerm = (term: string) => {
    return term.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships and billing information
          </p>
        </div>
        <AddClientDialog onClientAdded={fetchClients} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeClients}</p>
            <p className="text-xs text-muted-foreground mt-1">With invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Paid Revenue</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.paidRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">Failed to fetch clients: {error}</p>
            </div>
          )}

          {!isLoading && !error && filteredClients.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No clients found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search query
              </p>
            </div>
          )}

          {!isLoading && !error && filteredClients.length === 0 && !searchQuery && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first client to get started
              </p>
            </div>
          )}

          {!isLoading && !error && filteredClients.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead className="text-center">Invoices</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead>Client Since</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const totalBilled = client.invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
                  const invoiceCount = client.invoices?.length || 0;
                  
                  return (
                    <TableRow
                      key={client.id}
                      onClick={() => handleClientClick(client.id)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.billTo && (
                            <p className="text-sm text-muted-foreground">{client.billTo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate max-w-[200px]">
                                {client.email}
                              </span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{client.phone}</span>
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.contractTerm ? (
                          <Badge variant={getContractBadgeVariant(client.contractTerm)}>
                            {formatContractTerm(client.contractTerm)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoiceCount > 0 ? (
                          <Badge variant="outline">{invoiceCount}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalBilled > 0 ? (
                          <span className="font-medium">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(totalBilled)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(client.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}