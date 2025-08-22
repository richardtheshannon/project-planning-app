// src/app/dashboard/financials/invoices/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Invoice, Client, InvoiceStatus } from "@prisma/client";

type InvoiceWithClient = Invoice & { client: Client };

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceWithClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    amount: 0,
    status: "PENDING" as InvoiceStatus,
    issuedDate: "",
    dueDate: "",
  });

  // Fetch invoice data
  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/financials/invoices/${invoiceId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Invoice not found");
          router.push("/dashboard/financials/income");
          return;
        }
        throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();
      
      // Fetch client details separately if not included
      const clientResponse = await fetch(`/api/financials/clients`);
      if (clientResponse.ok) {
        const clients = await clientResponse.json();
        const client = clients.find((c: Client) => c.id === data.clientId);
        if (client) {
          data.client = client;
        }
      }

      setInvoice(data);
      
      // Initialize edit form with invoice data
      setEditForm({
        amount: data.amount,
        status: data.status,
        issuedDate: new Date(data.issuedDate).toISOString().split("T")[0],
        dueDate: new Date(data.dueDate).toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      setIsSaving(true);
      
      const payload = {
        amount: parseFloat(editForm.amount.toString()),
        status: editForm.status,
        issuedDate: editForm.issuedDate ? new Date(editForm.issuedDate).toISOString() : null,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
      };

      const response = await fetch(`/api/financials/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      const updatedInvoice = await response.json();
      setInvoice({ ...updatedInvoice, client: invoice.client });
      setIsEditing(false);
      toast.success("Invoice updated successfully");
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/financials/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      toast.success("Invoice deleted successfully");
      router.push("/dashboard/financials/income");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (invoice) {
      setEditForm({
        amount: invoice.amount,
        status: invoice.status,
        issuedDate: new Date(invoice.issuedDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
      });
    }
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "secondary";
      case "OVERDUE":
        return "destructive";
      case "DRAFT":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financials/income">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
          <Badge variant={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Invoice Number</Label>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Status</Label>
                {isEditing ? (
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => 
                      setEditForm({ ...editForm, status: value as InvoiceStatus })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(InvoiceStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => 
                      setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                ) : (
                  <p className="font-medium text-lg">{formatCurrency(invoice.amount)}</p>
                )}
              </div>
              
              <div>
                <Label className="text-muted-foreground">Client</Label>
                <p className="font-medium">
                  {invoice.client?.name || "Unknown Client"}
                </p>
                {invoice.client?.email && (
                  <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Issued Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.issuedDate}
                    onChange={(e) => 
                      setEditForm({ ...editForm, issuedDate: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{formatDate(invoice.issuedDate)}</p>
                )}
              </div>
              
              <div>
                <Label className="text-muted-foreground">Due Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => 
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(invoice.createdAt)}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{formatDate(invoice.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}