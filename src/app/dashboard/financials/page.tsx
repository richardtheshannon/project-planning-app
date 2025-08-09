// Imports for server-side data fetching
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { Invoice, Expense, Subscription, Client, Prisma } from "@prisma/client";
import { getMonth, getYear, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

// Define a type for invoices that includes the client relationship
type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: { select: { name: true } } }
}>;

// The page is now an async function to allow for server-side data fetching
export default async function FinancialsOverviewPage() {
  const session = await getServerSession(authOptions);

  // YTD Totals
  let totalRevenue = 0;
  let totalExpensesYTD = 0;
  let totalSubscriptionsYTD = 0;
  let netIncomeYTD = 0;
  let totalTaxesDue = 0;
  let upcomingPayments = 0;

  // Monthly Totals
  let lastMonthIncome = 0;
  let lastMonthExpenses = 0;
  let lastMonthSubscriptionsTotal = 0;
  let lastMonthNet = 0;

  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;
  let thisMonthSubscriptionsTotal = 0;
  let thisMonthNet = 0;

  let nextMonthIncome = 0;
  let nextMonthExpenses = 0;
  let nextMonthSubscriptionsTotal = 0;
  let nextMonthNet = 0;
  
  // Monthly Itemized Lists
  let lastMonthInvoices: InvoiceWithClient[] = [];
  let lastMonthExpenseItems: Expense[] = [];
  let lastMonthSubscriptionItems: Subscription[] = [];

  let thisMonthInvoices: InvoiceWithClient[] = [];
  let thisMonthExpenseItems: Expense[] = [];
  let thisMonthSubscriptionItems: Subscription[] = [];
  
  let nextMonthInvoices: InvoiceWithClient[] = [];
  let nextMonthExpenseItems: Expense[] = [];
  let nextMonthSubscriptionItems: Subscription[] = [];


  if (session?.user?.id) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDateYTD = new Date(currentYear, 0, 1);
    const endDateYTD = new Date(currentYear + 1, 0, 1);
    
    const lastMonthDate = subMonths(today, 1);
    const nextMonthDate = addMonths(today, 1);

    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const nextMonthStart = startOfMonth(nextMonthDate);
    const nextMonthEnd = endOfMonth(nextMonthDate);

    const [
      allInvoices, 
      allExpenses, 
      allSubscriptions,
      allClients
    ] = await Promise.all([
      prisma.invoice.findMany({ 
        where: { userId: session.user.id },
        include: { client: { select: { name: true } } }
      }),
      prisma.expense.findMany({ where: { userId: session.user.id } }),
      prisma.subscription.findMany({ where: { userId: session.user.id } }),
      prisma.client.findMany({ where: { userId: session.user.id } })
    ]);

    // --- YTD Calculations ---
    const paidInvoicesYTD = allInvoices.filter(inv => inv.status === 'PAID' && isWithinInterval(inv.issuedDate, { start: startDateYTD, end: endDateYTD }));
    totalRevenue = paidInvoicesYTD.reduce((sum, invoice) => sum + invoice.amount, 0);
    const expensesYTD = allExpenses.filter(exp => isWithinInterval(exp.date, { start: startDateYTD, end: endDateYTD }));
    totalExpensesYTD = expensesYTD.reduce((sum, expense) => sum + expense.amount, 0);
    totalSubscriptionsYTD = allSubscriptions.reduce((sum, sub) => {
      if (sub.billingCycle.toUpperCase() === 'MONTHLY') return sum + (sub.amount * 12);
      if (sub.billingCycle.toUpperCase() === 'ANNUALLY') return sum + sub.amount;
      return sum;
    }, 0);
    totalTaxesDue = totalRevenue * 0.20;
    netIncomeYTD = totalRevenue - totalTaxesDue - totalExpensesYTD - totalSubscriptionsYTD;

    // --- Monthly Item Filtering ---
    lastMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: thisMonthStart, end: thisMonthEnd }));
    nextMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: nextMonthStart, end: nextMonthEnd }));
    
    lastMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: thisMonthStart, end: thisMonthEnd }));
    nextMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: nextMonthStart, end: nextMonthEnd }));

    // --- Monthly Income Calculations (includes all invoice statuses) ---
    lastMonthIncome = lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    thisMonthIncome = thisMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    nextMonthIncome = nextMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // --- Monthly Expense Calculations (one-time expenses) ---
    lastMonthExpenses = lastMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    thisMonthExpenses = thisMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    nextMonthExpenses = nextMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);

    // --- Monthly Subscription & Forecast Calculations ---
    allClients.forEach(client => {
      if (!client.contractStartDate || !client.contractAmount || !client.frequency || client.frequency === 'One-Time' || !client.contractTerm) return;
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

      if (isWithinInterval(thisMonthStart, { start: contractStart, end: contractEnd })) {
        if (((thisMonthStart.getFullYear() - contractStart.getFullYear()) * 12 + thisMonthStart.getMonth() - contractStart.getMonth()) % frequencyMonths === 0) {
          thisMonthIncome += client.contractAmount;
        }
      }
      if (isWithinInterval(nextMonthStart, { start: contractStart, end: contractEnd })) {
        if (((nextMonthStart.getFullYear() - contractStart.getFullYear()) * 12 + nextMonthStart.getMonth() - contractStart.getMonth()) % frequencyMonths === 0) {
          nextMonthIncome += client.contractAmount;
        }
      }
    });

    allSubscriptions.forEach(sub => {
      let paymentDate = new Date(sub.nextPaymentDate);
      while (paymentDate <= nextMonthEnd) {
        if (isWithinInterval(paymentDate, { start: lastMonthStart, end: lastMonthEnd })) {
          lastMonthSubscriptionItems.push(sub);
        }
        if (isWithinInterval(paymentDate, { start: thisMonthStart, end: thisMonthEnd })) {
          thisMonthSubscriptionItems.push(sub);
        }
        if (isWithinInterval(paymentDate, { start: nextMonthStart, end: nextMonthEnd })) {
          nextMonthSubscriptionItems.push(sub);
        }
        if (sub.billingCycle.toUpperCase() === 'MONTHLY') {
          paymentDate = addMonths(paymentDate, 1);
        } else if (sub.billingCycle.toUpperCase() === 'ANNUALLY') {
          paymentDate = addMonths(paymentDate, 12);
        } else {
          break;
        }
      }
    });
    
    lastMonthSubscriptionsTotal = lastMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    thisMonthSubscriptionsTotal = thisMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    nextMonthSubscriptionsTotal = nextMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);

    lastMonthExpenses += lastMonthSubscriptionsTotal;
    thisMonthExpenses += thisMonthSubscriptionsTotal;
    nextMonthExpenses += nextMonthSubscriptionsTotal;

    lastMonthNet = lastMonthIncome - (lastMonthIncome * 0.20) - lastMonthExpenses;
    thisMonthNet = thisMonthIncome - (thisMonthIncome * 0.20) - thisMonthExpenses;
    nextMonthNet = nextMonthIncome - (nextMonthIncome * 0.20) - nextMonthExpenses;
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        <Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      {/* YTD Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Based on paid invoices this year.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Based on logged one-time expenses.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Subscriptions (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Based on annualized subscription costs.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Revenue minus taxes & all expenses.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Taxes Due (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Estimated 20% of total revenue.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Subscriptions due in the next 30 days.</p></CardContent></Card>
      </div>

      {/* Monthly Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Last Month Card */}
        <Card>
          <CardHeader><CardTitle>Last Month</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{lastMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="flex items-center text-sm font-bold"><TrendingUp className="h-4 w-4 mr-2" />Net</span><span className="font-bold">{lastMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="my-4 border-t"></div>
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold">Subscriptions</h4>
              {lastMonthSubscriptionItems.length > 0 ? lastMonthSubscriptionItems.map(sub => (<div key={sub.id} className="flex justify-between"><span>{sub.name}</span><span>{sub.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No subscriptions.</p>}
              <h4 className="font-semibold mt-2">Expenses</h4>
              {lastMonthExpenseItems.length > 0 ? lastMonthExpenseItems.map(exp => (<div key={exp.id} className="flex justify-between"><span>{exp.description}</span><span>{exp.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No expenses.</p>}
              <h4 className="font-semibold mt-2">Invoices</h4>
              {lastMonthInvoices.length > 0 ? lastMonthInvoices.map(inv => (<div key={inv.id} className="flex justify-between"><span>{inv.client.name}</span><span>{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No invoices.</p>}
            </div>
          </CardContent>
        </Card>
        {/* This Month Card */}
        <Card>
          <CardHeader><CardTitle>This Month</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{thisMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{thisMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="flex items-center text-sm font-bold"><TrendingUp className="h-4 w-4 mr-2" />Net</span><span className="font-bold">{thisMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="my-4 border-t"></div>
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold">Subscriptions</h4>
              {thisMonthSubscriptionItems.length > 0 ? thisMonthSubscriptionItems.map(sub => (<div key={sub.id} className="flex justify-between"><span>{sub.name}</span><span>{sub.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No subscriptions.</p>}
              <h4 className="font-semibold mt-2">Expenses</h4>
              {thisMonthExpenseItems.length > 0 ? thisMonthExpenseItems.map(exp => (<div key={exp.id} className="flex justify-between"><span>{exp.description}</span><span>{exp.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No expenses.</p>}
              <h4 className="font-semibold mt-2">Invoices</h4>
              {thisMonthInvoices.length > 0 ? thisMonthInvoices.map(inv => (<div key={inv.id} className="flex justify-between"><span>{inv.client.name}</span><span>{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No invoices.</p>}
            </div>
          </CardContent>
        </Card>
        {/* Next Month Card */}
        <Card>
          <CardHeader><CardTitle>Next Month (Forecast)</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{nextMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{nextMonthExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="flex items-center text-sm font-bold"><TrendingUp className="h-4 w-4 mr-2" />Net</span><span className="font-bold">{nextMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="my-4 border-t"></div>
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold">Subscriptions</h4>
              {nextMonthSubscriptionItems.length > 0 ? nextMonthSubscriptionItems.map(sub => (<div key={sub.id} className="flex justify-between"><span>{sub.name}</span><span>{sub.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No subscriptions.</p>}
              <h4 className="font-semibold mt-2">Expenses</h4>
              {nextMonthExpenseItems.length > 0 ? nextMonthExpenseItems.map(exp => (<div key={exp.id} className="flex justify-between"><span>{exp.description}</span><span>{exp.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No expenses.</p>}
              <h4 className="font-semibold mt-2">Invoices</h4>
              {nextMonthInvoices.length > 0 ? nextMonthInvoices.map(inv => (<div key={inv.id} className="flex justify-between"><span>{inv.client.name}</span><span>{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No invoices.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Visualizations */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive" />Alerts & Notifications</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Alerts for overdue invoices and upcoming subscriptions will appear here.</p></CardContent></Card>
        <Card className="lg:col-span-3"><CardHeader><CardTitle className="flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-primary" />Income vs. Expense</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">A chart comparing monthly income and expenses will be displayed here.</p></CardContent></Card>
      </div>
    </div>
  );
}
