// src/app/dashboard/financials/invoices/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Save, X, Plus, Calendar, Building2, Mail, Globe, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicePDFButton } from "@/components/financials/invoice-pdf-button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Invoice, Client, InvoiceStatus } from "@prisma/client";
import Image from "next/image";

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

type AppearanceSettings = {
  businessName?: string | null;
  lightModeLogoUrl?: string | null;
  lightModeIconUrl?: string | null;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceWithClientAndLineItems | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    amount: 0,
    status: "PENDING" as InvoiceStatus,
    issuedDate: "",
    dueDate: "",
  });

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch appearance settings
  const fetchAppearanceSettings = async () => {
    try {
      const response = await fetch('/api/appearance');
      if (response.ok) {
        const data = await response.json();
        setAppearanceSettings(data);
      }
    } catch (error) {
      console.error("Error fetching appearance settings:", error);
    }
  };

  // Fetch invoice data
  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/financials/invoices/${invoiceId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Invoice not found");
          router.push("/dashboard/financials/income/invoices");  // UPDATED
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
      fetchAppearanceSettings();
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

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/financials/invoices/${invoice.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      toast.success("Invoice deleted successfully");
      router.push("/dashboard/financials/income/invoices");  // UPDATED
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-4 text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 font-semibold mb-4">Invoice not found</p>
            <div className="text-center">
              <Link href="/dashboard/financials/income/invoices">  {/* UPDATED */}
                <Button variant="outline">Back to Invoices</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Line Item Card Component for Edit Mode
  const MobileLineItemCard = ({ item, index }: { item: LineItem; index: number }) => (
    <Card className="mb-3">
      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveLineItem(index)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={item.date}
              onChange={(e) => handleUpdateLineItem(index, 'date', e.target.value)}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs">Description</Label>
            <Input
              type="text"
              value={item.description}
              onChange={(e) => handleUpdateLineItem(index, 'description', e.target.value)}
              placeholder="Enter description"
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <Label className="text-xs">Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={item.amount}
              onChange={(e) => handleUpdateLineItem(index, 'amount', e.target.value)}
              className="w-full mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header with Action Buttons */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/financials/income/invoices">  {/* UPDATED */}
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">
                Invoice {invoice.invoiceNumber}
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <InvoicePDFButton invoiceNumber={invoice.invoiceNumber} />
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
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
        </div>
      </div>

      {/* Professional Invoice Layout */}
      <Card className="overflow-hidden" id="invoice-content">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 border-b">
          {/* Invoice Header with Logo and Company Info */}
          <div className="flex justify-between items-start mb-8">
            {/* Left side - Logo and Sender Info */}
            <div className="flex flex-col gap-4">

{/* Logo - Light Mode Logo with 80px height */}
{appearanceSettings?.lightModeLogoUrl && (
  <div className="mb-4">
    <div className="relative h-20 w-auto max-w-xs">
      <Image
        src={appearanceSettings.lightModeLogoUrl}
        alt={appearanceSettings.businessName || "Company Logo"}
        width={240}
        height={80}
        className="object-contain object-left h-20 w-auto"
        priority
      />
    </div>
  </div>
)}

              
              {/* Sender Information */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {appearanceSettings?.businessName || "SalesField Network"}
                </h2>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Richard Shannon</p>
                  <p>263 Dairyland Rd</p>
                  <p>Buellton, CA 93427</p>
                  <p>richard@salesfield.net</p>
                  <p>P: 805-720-8554</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Invoice label and details */}
            <div className="text-right">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">INVOICE</h1>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {invoice.invoiceNumber}
              </p>
              {isEditing ? (
                <Select
                  value={editForm.status}
                  onValueChange={(value) => 
                    setEditForm({ ...editForm, status: value as InvoiceStatus })
                  }
                >
                  <SelectTrigger className="w-[140px] mt-2">
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
                <Badge 
                  variant={getStatusColor(invoice.status)} 
                  className="mt-2 text-sm px-3 py-1"
                >
                  {invoice.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Bill To and Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bill To Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
                Bill To
              </h3>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                  {invoice.client?.name || "Unknown Client"}
                </p>
                {invoice.client?.billTo && (
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {invoice.client.billTo}
                  </p>
                )}
                {invoice.client?.email && (
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {invoice.client.email}
                  </p>
                )}
                {invoice.client?.phone && (
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {invoice.client.phone}
                  </p>
                )}
                {(invoice.client?.address1 || invoice.client?.city || invoice.client?.state) && (
                  <div className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      {invoice.client.address1 && <p>{invoice.client.address1}</p>}
                      {invoice.client.address2 && <p>{invoice.client.address2}</p>}
                      {(invoice.client.city || invoice.client.state || invoice.client.zipCode) && (
                        <p>
                          {invoice.client.city}{invoice.client.city && invoice.client.state && ", "}
                          {invoice.client.state} {invoice.client.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="md:text-right">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
                Invoice Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-slate-600 dark:text-slate-400">Issue Date:</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.issuedDate}
                      onChange={(e) => 
                        setEditForm({ ...editForm, issuedDate: e.target.value })
                      }
                      className="w-36"
                    />
                  ) : (
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(invoice.issuedDate)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-slate-600 dark:text-slate-400">Due Date:</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => 
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                      className="w-36"
                    />
                  ) : (
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(invoice.dueDate)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between md:justify-end gap-8 pt-2">
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Total Due:
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Line Items Section */}
          {isEditing ? (
            // Edit Mode
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Line Items</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddLineItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {isMobile ? (
                // Mobile Edit View
                <div>
                  {lineItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No line items. Click "Add Item" to create one.
                    </div>
                  ) : (
                    <>
                      {lineItems.map((item, index) => (
                        <MobileLineItemCard 
                          key={item.id || item.tempId} 
                          item={item} 
                          index={index} 
                        />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                // Desktop Edit View
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-32 text-right">Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
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
                              className="text-right"
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
                </Table>
              )}

              {/* Total in Edit Mode */}
              <div className="flex justify-end mt-6 pt-6 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="font-semibold">Subtotal:</span>
                    <span className="font-semibold">
                      {formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8 text-lg">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">
                      {formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              {invoice.lineItems && invoice.lineItems.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Date
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Description
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.lineItems.map((item: any) => (
                        <TableRow key={item.id} className="border-b">
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell className="text-slate-900 dark:text-slate-100">
                            {item.description}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Invoice Totals */}
                  <div className="flex justify-end mt-8">
                    <div className="w-72">
                      <div className="space-y-2 border-t-2 pt-4">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Subtotal:</span>
                          <span className="font-medium">
                            {formatCurrency(invoice.lineItems.reduce((sum: number, item: any) => sum + item.amount, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100 pt-2 border-t">
                          <span>Total Due:</span>
                          <span>{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

{/* Payment Instructions Footer */}
<div className="mt-12 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
    <div className="flex justify-between items-start">
      {/* Payment Instructions - Left Side */}
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Payment Instructions
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please make all checks payable to:
        </p>
        <div className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <p>Richard Shannon</p>
          <p>263 Dairyland Rd</p>
          <p>Buellton, CA 93427</p>
        </div>
      </div>
      
      {/* Icon Logo - Right Side */}
      {appearanceSettings?.lightModeIconUrl && (
        <div className="relative h-16 w-16 opacity-60">
          <Image
            src={appearanceSettings.lightModeIconUrl}
            alt={appearanceSettings.businessName || "Company Icon"}
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  </div>
</div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No line items for this invoice.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="mt-4"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Add Line Items
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}