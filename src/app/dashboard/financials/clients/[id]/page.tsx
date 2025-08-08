"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Client, type Invoice } from "@prisma/client";
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
import { ArrowLeft, Trash2, Loader2, AlertCircle, ExternalLink } from "lucide-react";

import EditClientDialog from "@/components/financials/EditClientDialog";

type ClientWithInvoices = Client & {
  invoices: Invoice[];
};

const formatContractTerm = (term: string) => {
    const terms: Record<string, string> = {
        ONE_MONTH: "1 Month",
        ONE_TIME: "One-Time",
        THREE_MONTH: "3 Month",
        SIX_MONTH: "6 Month",
        ONE_YEAR: "1 Year",
    };
    return terms[term] || "N/A";
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

  const handleClientUpdated = (updatedClient: Client) => {
    setClient(prevClient => {
        if (!prevClient) return null;
        return {
            ...prevClient,
            ...updatedClient,
        };
    });
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
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contact Email</span>
                    <span>{client.email || 'N/A'}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Website</span>
                    {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                            {client.website}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    ) : (
                        <span>N/A</span>
                    )}
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contract Start Date</span>
                    <span>{client.contractStartDate ? format(new Date(client.contractStartDate), "PPP") : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contract Terms</span>
                    <span>{formatContractTerm(client.contractTerm)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contract Amount</span>
                    <span>{client.contractAmount ? `$${client.contractAmount.toFixed(2)}` : 'N/A'}</span>
                </div>
                {client.notes && (
                    <div className="space-y-2 pt-2">
                        <span className="text-muted-foreground">Notes</span>
                        <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{client.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>

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
