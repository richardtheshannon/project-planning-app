// src/app/dashboard/financials/expenses/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogExpenseDialog } from "@/components/financials/LogExpenseDialog";
import { AddSubscriptionDialog } from "@/components/financials/AddSubscriptionDialog";
import EditExpenseDialog from "@/components/financials/EditExpenseDialog";
import EditSubscriptionDialog from "@/components/financials/EditSubscriptionDialog"; // Import the subscription dialog
import { Expense, ExpenseCategory, Subscription } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Component to display the list of expenses
function ExpenseList({ expenses, onExpenseSelect }: { expenses: Expense[], onExpenseSelect: (expense: Expense) => void }) {
    if (expenses.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">
                You haven't logged any expenses yet.
            </p>
        );
    }
    const formatCategory = (category: ExpenseCategory) => {
        return category.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {expenses.map((expense) => (
                    <TableRow key={expense.id} onClick={() => onExpenseSelect(expense)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{formatCategory(expense.category)}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(expense.amount)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// CORRECTED: Component to display the list of subscriptions now includes a selection handler
function SubscriptionList({ subscriptions, onSubscriptionSelect }: { subscriptions: Subscription[], onSubscriptionSelect: (subscription: Subscription) => void }) {
    if (subscriptions.length === 0) {
        return (
            <p className="py-4 text-center text-sm text-muted-foreground">
                You haven't added any subscriptions yet.
            </p>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subscriptions.map((sub) => (
                    <TableRow key={sub.id} onClick={() => onSubscriptionSelect(sub)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{sub.billingCycle}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(sub.nextPaymentDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                            {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                            }).format(sub.amount)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for managing the Edit Expense Dialog
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseEditDialogOpen, setIsExpenseEditDialogOpen] = useState(false);

  // CORRECTED: State for managing the Edit Subscription Dialog
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isSubscriptionEditDialogOpen, setIsSubscriptionEditDialogOpen] = useState(false);

  // Handler to open the expense dialog
  const handleExpenseSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseEditDialogOpen(true);
  };

  // CORRECTED: Handler to open the subscription dialog
  const handleSubscriptionSelect = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionEditDialogOpen(true);
  };

  // Function to fetch expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    try {
      const response = await fetch('/api/financials/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses.');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error("Error fetching expenses", { description: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, []);

  // Function to fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    setIsLoadingSubscriptions(true);
    try {
        const response = await fetch('/api/financials/subscriptions');
        if (!response.ok) throw new Error('Failed to fetch subscriptions.');
        const data = await response.json();
        setSubscriptions(data);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        toast.error("Error fetching subscriptions", { description: errorMessage });
        setError(errorMessage);
    } finally {
        setIsLoadingSubscriptions(false);
    }
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchExpenses();
    fetchSubscriptions();
  }, [fetchExpenses, fetchSubscriptions]);

  return (
    <div className="space-y-8">
      {/* Section: Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Log and categorize your business expenses.
            </CardDescription>
          </div>
          <LogExpenseDialog onExpenseAdded={fetchExpenses} />
        </CardHeader>
        <CardContent>
          {isLoadingExpenses && <p className="text-muted-foreground">Loading expenses...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoadingExpenses && !error && <ExpenseList expenses={expenses} onExpenseSelect={handleExpenseSelect} />}
        </CardContent>
      </Card>

      {/* Section: Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>
              Track your recurring monthly and annual subscriptions.
            </CardDescription>
          </div>
          <AddSubscriptionDialog onSubscriptionAdded={fetchSubscriptions} />
        </CardHeader>
        <CardContent>
            {isLoadingSubscriptions && <p className="text-muted-foreground">Loading subscriptions...</p>}
            {error && <p className="text-destructive">{error}</p>}
            {/* CORRECTED: Pass the selection handler to the SubscriptionList */}
            {!isLoadingSubscriptions && !error && <SubscriptionList subscriptions={subscriptions} onSubscriptionSelect={handleSubscriptionSelect} />}
        </CardContent>
      </Card>

      {/* The Edit Dialogs are now rendered here */}
      <EditExpenseDialog
        expense={selectedExpense}
        isOpen={isExpenseEditDialogOpen}
        onOpenChange={setIsExpenseEditDialogOpen}
        onExpenseUpdated={fetchExpenses}
      />
      {/* CORRECTED: Render the EditSubscriptionDialog */}
      <EditSubscriptionDialog
        subscription={selectedSubscription}
        isOpen={isSubscriptionEditDialogOpen}
        onOpenChange={setIsSubscriptionEditDialogOpen}
        onSubscriptionUpdated={fetchSubscriptions}
      />
    </div>
  );
}
