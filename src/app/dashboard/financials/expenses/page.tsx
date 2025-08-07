"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogExpenseDialog } from "@/components/financials/LogExpenseDialog";
import { AddSubscriptionDialog } from "@/components/financials/AddSubscriptionDialog";
import { Expense, ExpenseCategory, Subscription } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Component to display the list of expenses
function ExpenseList({ expenses }: { expenses: Expense[] }) {
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
                    <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{formatCategory(expense.category)}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                            ${expense.amount.toFixed(2)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

// NEW: Component to display the list of subscriptions
function SubscriptionList({ subscriptions }: { subscriptions: Subscription[] }) {
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
                    <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{sub.billingCycle}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(sub.nextPaymentDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                            ${sub.amount.toFixed(2)}
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

  // Function to fetch expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    try {
      const response = await fetch('/api/financials/expenses');
      if (!response.ok) throw new Error('Failed to fetch expenses.');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoadingExpenses(false);
    }
  }, []);

  // NEW: Function to fetch subscriptions
  const fetchSubscriptions = useCallback(async () => {
    setIsLoadingSubscriptions(true);
    try {
        const response = await fetch('/api/financials/subscriptions');
        if (!response.ok) throw new Error('Failed to fetch subscriptions.');
        const data = await response.json();
        setSubscriptions(data);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
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
          {!isLoadingExpenses && !error && <ExpenseList expenses={expenses} />}
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
            {!isLoadingSubscriptions && !error && <SubscriptionList subscriptions={subscriptions} />}
        </CardContent>
      </Card>
    </div>
  );
}
