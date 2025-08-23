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
  FileText
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
        router.push('/dashboard/financials/income');

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

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/financials/income')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-grow">
                <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
                <p className="text-muted-foreground">Client details and history.</p>
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

        <Card>
            <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>
                    Joined on {new Date(client.createdAt).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {client.billTo && (
                    <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bill To:</span>
                        <span className="font-medium">{client.billTo}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span>{client.email || 'Not provided'}</span>
                </div>
                
                {client.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{client.phone}</span>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Website:</span>
                    {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {client.website}
                        </a>
                    ) : (
                        <span>Not provided</span>
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
                
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Client Start Date</span>
                    <span>{client.contractStartDate ? format(new Date(client.contractStartDate), "PPP") : 'Not set'}</span>
                </div>
                
                {client.notes && (
                    <div className="space-y-2 pt-2">
                        <span className="text-muted-foreground">Notes</span>
                        <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{client.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {client.contacts && client.contacts.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Contacts</CardTitle>
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
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {contact.email}
                                            </span>
                                        )}
                                        {contact.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {contact.phone}
                                            </span>
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

        <Card>
            <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>
                    A list of all invoices associated with this client.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {client.invoices && client.invoices.length > 0 ? (
                    <div className="border rounded-md">
                        <div className="divide-y">
                            {client.invoices.map((invoice) => (
                                <div key={invoice.id} className="flex justify-between items-center p-3 hover:bg-muted/50">
                                    <div className="grid gap-1">
                                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Issued: {format(new Date(invoice.issuedDate), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div className="text-right grid gap-1">
                                        <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getStatusBadgeClass(invoice.status))}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
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