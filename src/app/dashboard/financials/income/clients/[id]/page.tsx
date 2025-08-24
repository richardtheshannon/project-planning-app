"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Client, type Invoice, type ClientContact } from "@prisma/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Globe,
  StickyNote,
  Users,
  ChevronRight
} from "lucide-react";

import EditClientDialog from "@/components/financials/EditClientDialog";

type ClientWithInvoices = Client & {
  invoices: Invoice[];
  contacts: ClientContact[];
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'PAID':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'OVERDUE':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientWithInvoices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/financials/clients/${clientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client data.");
      }
      const data: ClientWithInvoices = await response.json();
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleDelete = async () => {
    try {
        const response = await fetch(`/api/financials/clients/${clientId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete client.');
        }

        toast({ title: "Success", description: "Client has been deleted." });
        router.push('/dashboard/financials/income/clients');

    } catch (err) {
        toast({
            title: "Error",
            description: err instanceof Error ? err.message : "Could not delete client.",
            variant: "destructive",
        });
    }
  };

  const handleClientUpdated = (updatedClient: ClientWithInvoices) => {
    setClient(updatedClient);
  };

  const handleInvoiceClick = (invoiceId: string) => {
    router.push(`/dashboard/financials/invoices/${invoiceId}`);
  };

  const formatAddress = () => {
    if (!client) return null;
    const parts = [
      client.address1,
      client.address2,
      client.city && client.state ? `${client.city}, ${client.state}` : client.city || client.state,
      client.zipCode
    ].filter(Boolean);
    return parts.length > 0 ? parts : null;
  };

  // Calculate client statistics
  const calculateStats = () => {
    if (!client || !client.invoices) return { totalBilled: 0, totalPaid: 0, totalPending: 0, invoiceCount: 0 };
    
    return client.invoices.reduce((acc, invoice) => {
      acc.totalBilled += invoice.amount;
      acc.invoiceCount++;
      if (invoice.status === 'PAID') {
        acc.totalPaid += invoice.amount;
      } else if (invoice.status === 'PENDING' || invoice.status === 'OVERDUE') {
        acc.totalPending += invoice.amount;
      }
      return acc;
    }, { totalBilled: 0, totalPaid: 0, totalPending: 0, invoiceCount: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-destructive/10 border border-destructive rounded-lg p-4">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="font-semibold text-destructive">Error Loading Client</p>
        <p className="text-sm text-destructive/80">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
            Go Back
        </Button>
      </div>
    );
  }

  if (!client) {
    return (
        <div className="flex flex-col items-center justify-center h-48">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-semibold">Client not found.</p>
        </div>
    );
  }

  const addressParts = formatAddress();
  const stats = calculateStats();

  return (
    <div className="space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => router.push('/dashboard/financials/income/clients')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
                    <p className="text-muted-foreground">Client Profile</p>
                </div>
            </div>
            <div className="flex gap-2">
                <EditClientDialog client={client} onClientUpdated={handleClientUpdated} />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                client and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete client
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Billed</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(stats.totalBilled)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-muted-foreground">Paid</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(stats.totalPaid)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(stats.totalPending)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.invoiceCount}</p>
                </CardContent>
            </Card>
        </div>

        {/* Client Information */}
        <Card>
            <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>
                    Contact details and billing information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {client.billTo && (
                    <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bill To:</span>
                        <span className="font-medium">{client.billTo}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    {client.email ? (
                        <a href={`mailto:${client.email}`} className="text-blue-500 hover:underline">
                            {client.email}
                        </a>
                    ) : (
                        <span className="text-muted-foreground">Not provided</span>
                    )}
                </div>
                
                {client.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <a href={`tel:${client.phone}`} className="text-blue-500 hover:underline">
                            {client.phone}
                        </a>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Website:</span>
                    {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                            {client.website}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ) : (
                        <span className="text-muted-foreground">Not provided</span>
                    )}
                </div>
                
                {addressParts && (
                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Address:</span>
                        <div className="flex-1">
                            {addressParts.map((part, index) => (
                                <div key={index}>{part}</div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Client Since:</span>
                    <span>{format(new Date(client.createdAt), "MMMM d, yyyy")}</span>
                </div>

                {client.contractStartDate && (
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Contract Start:</span>
                        <span>{format(new Date(client.contractStartDate), "MMMM d, yyyy")}</span>
                    </div>
                )}
                
                {client.notes && (
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Notes</span>
                        </div>
                        <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{client.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Contacts */}
        {client.contacts && client.contacts.length > 0 && (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Contacts</CardTitle>
                    </div>
                    <CardDescription>
                        People associated with this client
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {client.contacts.map((contact) => (
                            <div key={contact.id} className="flex items-start justify-between p-3 border rounded-lg">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{contact.name}</span>
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        {contact.email && (
                                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Mail className="h-3 w-3" />
                                                {contact.email}
                                            </a>
                                        )}
                                        {contact.phone && (
                                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                                                <Phone className="h-3 w-3" />
                                                {contact.phone}
                                            </a>
                                        )}
                                    </div>
                                    {contact.note && (
                                        <p className="text-sm text-muted-foreground mt-1">{contact.note}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Invoice History */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle>Invoice History</CardTitle>
                </div>
                <CardDescription>
                    All invoices associated with this client
                </CardDescription>
            </CardHeader>
            <CardContent>
                {client.invoices && client.invoices.length > 0 ? (
                    <div className="border rounded-md">
                        <div className="divide-y">
                            {client.invoices
                                .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
                                .map((invoice) => {
                                    const isOverdue = invoice.status === 'PENDING' && new Date(invoice.dueDate) < new Date();
                                    return (
                                        <div 
                                            key={invoice.id} 
                                            className="flex justify-between items-center p-3 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => handleInvoiceClick(invoice.id)}
                                        >
                                            <div className="grid gap-1">
                                                <p className="font-semibold">{invoice.invoiceNumber}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Issued: {format(new Date(invoice.issuedDate), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                            <div className="text-right grid gap-1">
                                                <p className="font-semibold">
                                                    {new Intl.NumberFormat("en-US", {
                                                        style: "currency",
                                                        currency: "USD",
                                                    }).format(invoice.amount)}
                                                </p>
                                                <span className={cn(
                                                    "text-xs font-medium px-2 py-0.5 rounded-full", 
                                                    getStatusBadgeClass(isOverdue ? 'OVERDUE' : invoice.status)
                                                )}>
                                                    {isOverdue ? 'OVERDUE' : invoice.status}
                                                </span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                            No invoices found for this client.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}