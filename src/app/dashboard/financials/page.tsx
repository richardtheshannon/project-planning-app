// src/app/dashboard/financials/page.tsx

// Imports for server-side data fetching
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { type Invoice, type Expense, type Subscription, type Client, type Prisma, ExpenseCategory } from "@prisma/client";
import { subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, addDays } from "date-fns";

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: { select: { name: true } } }
}>;

export default async function FinancialsOverviewPage() {
  const session = await getServerSession(authOptions);

  // Initialize all variables
  let totalRevenue = 0, totalExpensesYTD = 0, totalSubscriptionsYTD = 0, netIncomeYTD = 0, totalTaxesDue = 0, upcomingPayments = 0;
  let lastMonthIncome = 0, lastMonthExpenses = 0, lastMonthSubscriptionsTotal = 0, lastMonthNet = 0;
  let thisMonthIncome = 0, thisMonthExpenses = 0, thisMonthSubscriptionsTotal = 0, thisMonthNet = 0;
  let nextMonthIncome = 0, nextMonthExpenses = 0, nextMonthSubscriptionsTotal = 0, nextMonthNet = 0;
  let lastMonthInvoices: InvoiceWithClient[] = [], lastMonthExpenseItems: Expense[] = [], lastMonthSubscriptionItems: Subscription[] = [];
  let thisMonthInvoices: InvoiceWithClient[] = [], thisMonthExpenseItems: Expense[] = [], thisMonthSubscriptionItems: Subscription[] = [];
  let nextMonthInvoices: InvoiceWithClient[] = [], nextMonthExpenseItems: Expense[] = [], nextMonthSubscriptionItems: Subscription[] = [];

  // ✅ FIX: Initialize the net expense variables outside the if block
  let totalLastMonthExpensesForNet = 0;
  let totalThisMonthExpensesForNet = 0;
  let totalNextMonthExpensesForNet = 0;

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
      allSubscriptions
    ] = await Promise.all([
      prisma.invoice.findMany({ 
        include: { client: { select: { name: true } } }
      }),
      prisma.expense.findMany({}),
      prisma.subscription.findMany({})
    ]);

    // --- YTD Calculations ---
    const paidInvoicesYTD = allInvoices.filter(inv => inv.status === 'PAID' && isWithinInterval(inv.issuedDate, { start: startDateYTD, end: endDateYTD }));
    totalRevenue = paidInvoicesYTD.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const oneTimeExpensesYTD = allExpenses.filter(exp => isWithinInterval(exp.date, { start: startDateYTD, end: endDateYTD })).reduce((sum, expense) => sum + expense.amount, 0);
    
    totalSubscriptionsYTD = allSubscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'MONTHLY') return sum + (sub.amount * 12);
      if (sub.billingCycle === 'ANNUALLY') return sum + sub.amount;
      return sum;
    }, 0);

    totalExpensesYTD = oneTimeExpensesYTD + totalSubscriptionsYTD;
    totalTaxesDue = totalRevenue * 0.20;
    netIncomeYTD = totalRevenue - totalTaxesDue - totalExpensesYTD;

    const upcomingPaymentsEndDate = addDays(today, 30);
    const monthlySubscriptionsTotalUpcoming = allSubscriptions
      .filter(s => s.billingCycle === 'MONTHLY')
      .reduce((sum, s) => sum + s.amount, 0);
    const annualSubscriptionsUpcoming = allSubscriptions
      .filter(s => s.billingCycle === 'ANNUALLY' && s.dueDate && isWithinInterval(s.dueDate, { start: today, end: upcomingPaymentsEndDate }))
      .reduce((sum, s) => sum + s.amount, 0);
    upcomingPayments = monthlySubscriptionsTotalUpcoming + annualSubscriptionsUpcoming;

    // --- Monthly Item Filtering ---
    lastMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: thisMonthStart, end: thisMonthEnd }));
    nextMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: nextMonthStart, end: nextMonthEnd }));
    
    lastMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: thisMonthStart, end: thisMonthEnd }));
    nextMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: nextMonthStart, end: nextMonthEnd }));

    // --- Monthly Income Calculations (from Invoices only) ---
    lastMonthIncome = lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    thisMonthIncome = thisMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    nextMonthIncome = nextMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // --- Monthly Subscription & Expense Logic ---
    allSubscriptions.forEach(sub => {
        if (sub.billingCycle === 'MONTHLY') {
            lastMonthSubscriptionItems.push(sub);
            thisMonthSubscriptionItems.push(sub);
            nextMonthSubscriptionItems.push(sub);
        } else if (sub.billingCycle === 'ANNUALLY' && sub.dueDate) {
            const syntheticExpense: Expense = {
                id: `sub-${sub.id}`,
                description: `${sub.name} (Annual)`,
                amount: sub.amount,
                date: sub.dueDate,
                userId: sub.userId,
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
                category: ExpenseCategory.OTHER,
            };
            if (isWithinInterval(sub.dueDate, { start: lastMonthStart, end: lastMonthEnd })) lastMonthExpenseItems.push(syntheticExpense);
            if (isWithinInterval(sub.dueDate, { start: thisMonthStart, end: thisMonthEnd })) thisMonthExpenseItems.push(syntheticExpense);
            if (isWithinInterval(sub.dueDate, { start: nextMonthStart, end: nextMonthEnd })) nextMonthExpenseItems.push(syntheticExpense);
        }
    });
    
    // Calculate one-time expenses (including synthesized annual subscriptions)
    lastMonthExpenses = lastMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    thisMonthExpenses = thisMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    nextMonthExpenses = nextMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate monthly subscription totals (only contains monthly subscriptions now)
    lastMonthSubscriptionsTotal = lastMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    thisMonthSubscriptionsTotal = thisMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    nextMonthSubscriptionsTotal = nextMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);

    // The total monthly expense for the summary card is the sum of one-time expenses and monthly subscriptions.
    totalLastMonthExpensesForNet = lastMonthExpenses + lastMonthSubscriptionsTotal;
    totalThisMonthExpensesForNet = thisMonthExpenses + thisMonthSubscriptionsTotal;
    totalNextMonthExpensesForNet = nextMonthExpenses + nextMonthSubscriptionsTotal;

    // Calculate Net income using the corrected total expense
    lastMonthNet = lastMonthIncome - (lastMonthIncome * 0.20) - totalLastMonthExpensesForNet;
    thisMonthNet = thisMonthIncome - (thisMonthIncome * 0.20) - totalThisMonthExpensesForNet;
    nextMonthNet = nextMonthIncome - (nextMonthIncome * 0.20) - totalNextMonthExpensesForNet;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        <Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Sum of all invoices with status 'PAID' this year.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Sum of one-time expenses, annual subs, & monthly subs x12.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Subscriptions (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Annual subscriptions plus monthly subscriptions x12.</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Revenue minus taxes & all YTD expenses (incl. annualized subs).</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Taxes Due (YTD)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Calculated as 20% of the Total Revenue (YTD).</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div><p className="text-xs text-muted-foreground">Sum of monthly subs + annual subs due in next 30 days.</p></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Last Month</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{totalLastMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
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
        <Card>
          <CardHeader><CardTitle>This Month</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{thisMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{totalThisMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
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
        <Card>
          <CardHeader><CardTitle>Next Month (Forecast)</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{nextMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{totalNextMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive" />Alerts & Notifications</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Alerts for overdue invoices and upcoming subscriptions will appear here.</p></CardContent></Card>
        <Card className="lg:col-span-3"><CardHeader><CardTitle className="flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-primary" />Income vs. Expense</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">A chart comparing monthly income and expenses will be displayed here.</p></CardContent></Card>
      </div>
    </div>
  );
}
