// Imports for server-side data fetching
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { Invoice, Expense, Subscription } from "@prisma/client"; // Added Subscription type

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload } from "lucide-react";

// The page is now an async function to allow for server-side data fetching
export default async function FinancialsOverviewPage() {
  const session = await getServerSession(authOptions);

  let totalRevenue = 0;
  let totalExpenses = 0;
  let netIncome = 0;
  let totalTaxesDue = 0;
  let upcomingPayments = 0; // Initialize upcomingPayments

  // Ensure there is a session and a user ID before fetching data
  if (session?.user?.id) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear + 1, 0, 1);
    
    const today = new Date();
    const upcomingLimit = new Date();
    upcomingLimit.setDate(today.getDate() + 30);

    // Fetch all necessary data in parallel for efficiency
    const [paidInvoices, expenses, subscriptions] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: session.user.id, status: 'PAID', issuedDate: { gte: startDate, lt: endDate } },
      }),
      prisma.expense.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lt: endDate } },
      }),
      prisma.subscription.findMany({
        where: { userId: session.user.id },
      }),
    ]);

    // --- Perform Calculations ---

    totalRevenue = paidInvoices.reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);
    totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    totalTaxesDue = totalRevenue * 0.20;
    netIncome = totalRevenue - totalTaxesDue - totalExpenses;

    // Calculate upcoming payments ONLY from subscriptions
    const upcomingSubscriptionTotal = subscriptions.reduce((sum: number, sub: Subscription) => {
      let nextPayment = new Date(sub.nextPaymentDate);
      // If the next payment date is in the past, calculate the true next payment date
      while (nextPayment < today) {
        if (sub.billingCycle.toUpperCase() === 'MONTHLY') {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
        } else if (sub.billingCycle.toUpperCase() === 'ANNUALLY') {
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        } else {
          break; // Break for non-recurring or unknown cycles
        }
      }
      // Add to sum if the true next payment is within 30 days
      if (nextPayment >= today && nextPayment < upcomingLimit) {
        return sum + sub.amount;
      }
      return sum;
    }, 0);
    
    upcomingPayments = upcomingSubscriptionTotal;
  }

  return (
    <div className="space-y-8">
      {/* Section: Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
        <Button variant="secondary">
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {/* Section: Key Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on paid invoices this year.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on logged expenses this year.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue minus taxes & expenses.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Taxes Due (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated 20% of total revenue.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions due in the next 30 days.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section: Alerts and Visualizations */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Alerts for overdue invoices and upcoming subscriptions will appear here.
            </p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Income vs. Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
              A chart comparing monthly income and expenses will be displayed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
