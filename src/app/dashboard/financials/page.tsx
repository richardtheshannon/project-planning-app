// Imports for server-side data fetching
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { Invoice, Expense, Subscription, Client } from "@prisma/client";
import { getMonth, getYear, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp } from "lucide-react";

// The page is now an async function to allow for server-side data fetching
export default async function FinancialsOverviewPage() {
  const session = await getServerSession(authOptions);

  // YTD Totals
  let totalRevenue = 0;
  let totalExpensesYTD = 0;
  let totalSubscriptionsYTD = 0;
  let netIncome = 0;
  let totalTaxesDue = 0;
  let upcomingPayments = 0;

  // Monthly Totals
  let lastMonthIncome = 0;
  let lastMonthExpenses = 0;
  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;
  let nextMonthIncome = 0;
  let nextMonthExpenses = 0;

  // Ensure there is a session and a user ID before fetching data
  if (session?.user?.id) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDateYTD = new Date(currentYear, 0, 1);
    const endDateYTD = new Date(currentYear + 1, 0, 1);
    const upcomingLimit = new Date();
    upcomingLimit.setDate(today.getDate() + 30);

    // --- Define Date Ranges for Monthly Cards ---
    const lastMonthDate = subMonths(today, 1);
    const nextMonthDate = addMonths(today, 1);

    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);

    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    
    const nextMonthStart = startOfMonth(nextMonthDate);
    const nextMonthEnd = endOfMonth(nextMonthDate);

    // --- Fetch all necessary data in parallel for efficiency ---
    const [
      paidInvoices, 
      allExpenses, 
      allSubscriptions,
      allClients
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: session.user.id, status: 'PAID' },
      }),
      prisma.expense.findMany({
        where: { userId: session.user.id },
      }),
      prisma.subscription.findMany({
        where: { userId: session.user.id },
      }),
      prisma.client.findMany({
        where: { userId: session.user.id }
      })
    ]);

    // --- Perform YTD Calculations ---
    const paidInvoicesYTD = paidInvoices.filter(inv => inv.issuedDate >= startDateYTD && inv.issuedDate < endDateYTD);
    const expensesYTD = allExpenses.filter(exp => exp.date >= startDateYTD && exp.date < endDateYTD);
    
    totalRevenue = paidInvoicesYTD.reduce((sum, invoice) => sum + invoice.amount, 0);
    totalExpensesYTD = expensesYTD.reduce((sum, expense) => sum + expense.amount, 0);
    totalSubscriptionsYTD = allSubscriptions.reduce((sum, sub) => {
      if (sub.billingCycle.toUpperCase() === 'MONTHLY') return sum + (sub.amount * 12);
      if (sub.billingCycle.toUpperCase() === 'ANNUALLY') return sum + sub.amount;
      return sum;
    }, 0);
    totalTaxesDue = totalRevenue * 0.20;
    netIncome = totalRevenue - totalTaxesDue - totalExpensesYTD - totalSubscriptionsYTD;
    
    // --- Perform Monthly Expense Calculations ---
    lastMonthExpenses = allExpenses.filter(exp => isWithinInterval(exp.date, { start: lastMonthStart, end: lastMonthEnd })).reduce((sum, exp) => sum + exp.amount, 0);
    thisMonthExpenses = allExpenses.filter(exp => isWithinInterval(exp.date, { start: thisMonthStart, end: thisMonthEnd })).reduce((sum, exp) => sum + exp.amount, 0);

    const monthlySubscriptionCost = allSubscriptions.reduce((sum, sub) => {
        if (sub.billingCycle.toUpperCase() === 'MONTHLY') return sum + sub.amount;
        if (sub.billingCycle.toUpperCase() === 'ANNUALLY') return sum + (sub.amount / 12);
        return sum;
    }, 0);

    lastMonthExpenses += monthlySubscriptionCost;
    thisMonthExpenses += monthlySubscriptionCost;
    nextMonthExpenses += monthlySubscriptionCost;

    // --- Perform Monthly Income Calculations ---
    lastMonthIncome = paidInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: lastMonthStart, end: lastMonthEnd })).reduce((sum, inv) => sum + inv.amount, 0);
    
    // --- Forecasted Income from Client Contracts ---
    allClients.forEach(client => {
      if (!client.contractStartDate || !client.contractAmount || !client.frequency || client.frequency === 'One-Time' || !client.contractTerm) {
        return;
      }

      const contractStart = new Date(client.contractStartDate);
      let termMonths = 0;
      switch (client.contractTerm) {
        case 'ONE_MONTH': termMonths = 1; break;
        case 'THREE_MONTH': termMonths = 3; break;
        case 'SIX_MONTH': termMonths = 6; break;
        case 'ONE_YEAR': termMonths = 12; break;
        default: return;
      }
      const contractEnd = addMonths(contractStart, termMonths);

      let frequencyMonths = 0;
      switch (client.frequency) {
        case '1 Month': frequencyMonths = 1; break;
        case '3 Month': frequencyMonths = 3; break;
        case '6 Month': frequencyMonths = 6; break;
        case 'Annually': frequencyMonths = 12; break;
        default: return;
      }

      // Check This Month
      if (isWithinInterval(thisMonthStart, { start: contractStart, end: contractEnd })) {
        const monthDiff = (thisMonthStart.getFullYear() - contractStart.getFullYear()) * 12 + (thisMonthStart.getMonth() - contractStart.getMonth());
        if (monthDiff >= 0 && monthDiff % frequencyMonths === 0) {
          thisMonthIncome += client.contractAmount;
        }
      }

      // Check Next Month
      if (isWithinInterval(nextMonthStart, { start: contractStart, end: contractEnd })) {
        const monthDiff = (nextMonthStart.getFullYear() - contractStart.getFullYear()) * 12 + (nextMonthStart.getMonth() - contractStart.getMonth());
        if (monthDiff >= 0 && monthDiff % frequencyMonths === 0) {
          nextMonthIncome += client.contractAmount;
        }
      }
    });


    upcomingPayments = allSubscriptions.reduce((sum, sub) => {
      let nextPayment = new Date(sub.nextPaymentDate);
      while (nextPayment < today) {
        if (sub.billingCycle.toUpperCase() === 'MONTHLY') nextPayment.setMonth(nextPayment.getMonth() + 1);
        else if (sub.billingCycle.toUpperCase() === 'ANNUALLY') nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        else break;
      }
      if (nextPayment >= today && nextPayment < upcomingLimit) return sum + sub.amount;
      return sum;
    }, 0);
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
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

      {/* YTD Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Based on paid invoices this year.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Based on logged one-time expenses.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Based on annualized subscription costs.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Revenue minus taxes & all expenses.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Taxes Due (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Estimated 20% of total revenue.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Subscriptions due in the next 30 days.</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Last Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center text-green-500"><ArrowUp className="h-4 w-4 mr-1" />Income</span>
              <span>{lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center text-red-500"><ArrowDown className="h-4 w-4 mr-1" />Expenses</span>
              <span>{lastMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center text-green-500"><ArrowUp className="h-4 w-4 mr-1" />Income</span>
              <span>{thisMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center text-red-500"><ArrowDown className="h-4 w-4 mr-1" />Expenses</span>
              <span>{thisMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Month (Forecast)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="flex items-center text-green-500"><ArrowUp className="h-4 w-4 mr-1" />Income</span>
              <span>{nextMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center text-red-500"><ArrowDown className="h-4 w-4 mr-1" />Expenses</span>
              <span>{nextMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Visualizations */}
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
