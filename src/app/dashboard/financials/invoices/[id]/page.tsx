// src/app/dashboard/financials/invoices/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Save, X, Plus, Calendar } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Invoice, Client, InvoiceStatus } from "@prisma/client";

type LineItem = {
  id?: string;
  date: string;
  description: string;
  amount: number;
  tempId?: string; // For new items before saving
};

type InvoiceWithClientAndLineItems = Invoice & { 
  client: Client;
  lineItems?: LineItem[];
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceWithClientAndLineItems | null>(null);
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

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

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

      // Initialize line items
      if (data.lineItems) {
        setLineItems(data.lineItems.map((item: any) => ({
          id: item.id,
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description,
          amount: item.amount,
        })));
      }
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

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      tempId: `temp-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    };
    setLineItems(updatedItems);

    // Update total amount if amount changes
    if (field === 'amount') {
      const total = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      setEditForm({ ...editForm, amount: total });
    }
  };

  const handleRemoveLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    
    // Update total amount
    const total = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    setEditForm({ ...editForm, amount: total });
  };

  const handleSave = async () => {
    if (!invoice) return;

    try {
      setIsSaving(true);
      
      const payload = {
        amount: parseFloat(editForm.amount.toString()),
        status: editForm.status,
        issuedDate: editForm.issuedDate ? new Date(editForm.issuedDate).toISOString() : null,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
        lineItems: lineItems.map(item => ({
          id: item.id,
          date: new Date(item.date).toISOString(),
          description: item.description,
          amount: item.amount,
        })),
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
      
      // Update line items with returned data
      if (updatedInvoice.lineItems) {
        setLineItems(updatedInvoice.lineItems.map((item: any) => ({
          id: item.id,
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description,
          amount: item.amount,
        })));
      }
      
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
      
      // Reset line items
      if (invoice.lineItems) {
        setLineItems(invoice.lineItems.map((item: any) => ({
          id: item.id,
          date: new Date(item.date).toISOString().split("T")[0],
          description: item.description,
          amount: item.amount,
        })));
      } else {
        setLineItems([]);
      }
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
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/financials/income">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <Badge variant={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Total Amount</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => 
                        setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })
                      }
                      disabled={lineItems.length > 0}
                    />
                    {lineItems.length > 0 && (
                      <span className="text-xs text-muted-foreground">Auto-calculated from line items</span>
                    )}
                  </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Line Items Card - Only show when editing */}
        {isEditing && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddLineItem}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="w-[120px]">Amount</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No line items. Click "Add Item" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lineItems.map((item, index) => (
                        <TableRow key={item.id || item.tempId}>
                          <TableCell>
                            <Input
                              type="date"
                              value={item.date}
                              onChange={(e) => 
                                handleUpdateLineItem(index, 'date', e.target.value)
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              value={item.description}
                              onChange={(e) => 
                                handleUpdateLineItem(index, 'description', e.target.value)
                              }
                              placeholder="Enter description"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => 
                                handleUpdateLineItem(index, 'amount', e.target.value)
                              }
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveLineItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {lineItems.length > 0 && (
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2} className="text-right">
                        Total:
                      </TableCell>
                      <TableCell>
                        {formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items Display - Only show when NOT editing and has items */}
        {!isEditing && invoice.lineItems && invoice.lineItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow className="font-semibold">
                    <TableCell colSpan={2} className="text-right">
                      Total:
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.lineItems.reduce((sum: number, item: any) => sum + item.amount, 0))}
                    </TableCell>
                  </TableRow>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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