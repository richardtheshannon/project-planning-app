"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddClientDialog } from "@/components/financials/AddClientDialog";
import { Client } from "@prisma/client";

// A simple component to display the list of clients
function ClientList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground">
        You haven't added any clients yet.
      </p>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center justify-between p-4">
          <div>
            <p className="font-semibold">{client.name}</p>
            <p className="text-sm text-muted-foreground">{client.email || 'No email provided'}</p>
          </div>
          {/* Placeholder for future action buttons (Edit, View) */}
        </div>
      ))}
    </div>
  );
}

export default function IncomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch clients from the API
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/financials/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients.');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clients when the component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-8">
      {/* Section: Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Manage your clients and view their lifetime value.
            </CardDescription>
          </div>
          {/* The AddClientDialog now triggers a refresh when a client is added */}
          <AddClientDialog onClientAdded={fetchClients} />
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">Loading clients...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && <ClientList clients={clients} />}
        </CardContent>
      </Card>

      {/* Section: Invoices (remains a placeholder for now) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Track your invoices and their payment status.
            </CardDescription>
          </div>
          {/* This button will be wired up in a future step */}
          <button className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            New Invoice
          </button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A table of your invoices will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
