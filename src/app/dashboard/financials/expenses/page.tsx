"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogExpenseDialog } from "@/components/financials/LogExpenseDialog";
import { AddSubscriptionDialog } from "@/components/financials/AddSubscriptionDialog";
import { toast } from "sonner";
import { SubscriptionsDataTable } from "@/components/financials/SubscriptionsDataTable";
import { ExpensesDataTable } from "@/components/financials/ExpensesDataTable";

// ✅ FIX: Define types locally to remove the server-only @prisma/client dependency.
// This makes the component fully client-side and prevents build errors.
type ExpenseCategory = "SOFTWARE" | "MARKETING" | "OFFICE_SUPPLIES" | "TRAVEL" | "OTHER";
type BillingCycle = "MONTHLY" | "ANNUALLY";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dynamically import the dialogs to ensure they are only loaded on the client
const EditExpenseDialog = dynamic(() => import('@/components/financials/EditExpenseDialog'));
const EditSubscriptionDialog = dynamic(() => import('@/components/financials/EditSubscriptionDialog'));

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseEditDialogOpen, setIsExpenseEditDialogOpen] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isSubscriptionEditDialogOpen, setIsSubscriptionEditDialogOpen] = useState(false);

  const handleExpenseSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseEditDialogOpen(true);
  };

  const handleSubscriptionSelect = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionEditDialogOpen(true);
  };

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

  useEffect(() => {
    fetchExpenses();
    fetchSubscriptions();
  }, [fetchExpenses, fetchSubscriptions]);

  return (
    <>
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
            {!isLoadingExpenses && !error && <ExpensesDataTable data={expenses} onExpenseSelect={handleExpenseSelect} />}
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
              {/* ✅ FIX: Removed the unnecessary 'onSubscriptionSelect' prop */}
              {!isLoadingSubscriptions && !error && <SubscriptionsDataTable data={subscriptions} />}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs for editing items */}
      <EditExpenseDialog
        expense={selectedExpense}
        isOpen={isExpenseEditDialogOpen}
        onOpenChange={setIsExpenseEditDialogOpen}
        onExpenseUpdated={fetchExpenses}
      />
      <EditSubscriptionDialog
        subscription={selectedSubscription}
        isOpen={isSubscriptionEditDialogOpen}
        onOpenChange={setIsSubscriptionEditDialogOpen}
        onSubscriptionUpdated={fetchSubscriptions}
      />
    </>
  );
}
