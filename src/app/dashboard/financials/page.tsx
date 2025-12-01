// src/app/dashboard/financials/page.tsx

// Add caching: revalidate every 5 minutes for financial data
export const revalidate = 300;

// Imports for server-side data fetching
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import { type Invoice, type Expense, type Subscription, type Prisma, ExpenseCategory, type Client, ContractTerm } from "@prisma/client";
import { subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, addDays, startOfYear, getMonth, getYear, parseISO, isBefore, isAfter, isEqual } from "date-fns";

// Client component for notifications
import { FinancialsClientWrapper } from "./components/FinancialsClientWrapper";

// UI component imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";

import FinancialsLineChart, { FinancialsChartDataPoint } from "./components/FinancialsLineChart";
import { getFinancialTrendsData } from "@/lib/financial-data";

type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: { select: { name: true } } }
}>;

interface ForecastedItem {
  id: string;
  name: string;
  amount: number;
}


export default async function FinancialsOverviewPage() {
  const session = await getServerSession(authOptions);

  let totalRevenue = 0, totalExpensesYTD = 0, totalSubscriptionsYTD = 0, netIncomeYTD = 0, totalTaxesDue = 0, upcomingPayments = 0;
  let lastMonthIncome = 0, lastMonthExpenses = 0, lastMonthSubscriptionsTotal = 0, lastMonthNet = 0;
  let thisMonthIncome = 0, thisMonthExpenses = 0, thisMonthSubscriptionsTotal = 0, thisMonthNet = 0;
  let nextMonthIncome = 0, nextMonthExpenses = 0, nextMonthSubscriptionsTotal = 0, nextMonthNet = 0;
  let lastMonthInvoices: InvoiceWithClient[] = [], lastMonthExpenseItems: Expense[] = [], lastMonthSubscriptionItems: Subscription[] = [];
  let thisMonthInvoices: InvoiceWithClient[] = [], thisMonthExpenseItems: Expense[] = [], thisMonthSubscriptionItems: Subscription[] = [];
  let nextMonthInvoices: InvoiceWithClient[] = [], nextMonthExpenseItems: Expense[] = [], nextMonthSubscriptionItems: Subscription[] = [], nextMonthForecastedItems: ForecastedItem[] = [];
  let chartData: FinancialsChartDataPoint[] = [];

  let totalLastMonthExpensesForNet = 0;
  let totalThisMonthExpensesForNet = 0;
  let totalNextMonthExpensesForNet = 0;
  
  // Alert data
  let overdueInvoices: InvoiceWithClient[] = [];
  let upcomingSubscriptions: Subscription[] = [];
  let isLowCashFlow = false;

  // We still check for a session to ensure only logged-in users can see the page.
  if (session?.user?.id) {
    const today = new Date();
    const startDateYTD = startOfYear(today);
    
    const lastMonthDate = subMonths(today, 1);
    const nextMonthDate = addMonths(today, 1);

    const lastMonthStart = startOfMonth(lastMonthDate);
    const lastMonthEnd = endOfMonth(lastMonthDate);
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    const nextMonthStart = startOfMonth(nextMonthDate);
    const nextMonthEnd = endOfMonth(nextMonthDate);

    // --- MODIFICATION START ---
    // The 'userId' filter has been removed from all 'where' clauses below
    // to fetch data for all users, making the page collaborative.
    const [
      allInvoices,
      allExpenses,
      allSubscriptions,
      chartData
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: { issuedDate: { gte: startDateYTD } },
        include: { client: { select: { name: true } } }
      }),
      prisma.expense.findMany({ where: { date: { gte: startDateYTD } } }),
      prisma.subscription.findMany(),
      getFinancialTrendsData() // Use the shared function from lib
    ]);
    // --- MODIFICATION END ---

    const paidInvoicesYTD = allInvoices.filter(inv => inv.status === 'PAID');
    totalRevenue = paidInvoicesYTD.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const oneTimeExpensesYTD = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
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

    lastMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthInvoices = allInvoices.filter(inv => isWithinInterval(inv.issuedDate, { start: thisMonthStart, end: thisMonthEnd }));
    
    lastMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: lastMonthStart, end: lastMonthEnd }));
    thisMonthExpenseItems = allExpenses.filter(exp => isWithinInterval(exp.date, { start: thisMonthStart, end: thisMonthEnd }));
    
    lastMonthIncome = lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    thisMonthIncome = thisMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    const draftPendingInvoicesNextMonth = allInvoices.filter(inv => 
      (inv.status === 'DRAFT' || inv.status === 'PENDING' || inv.status === 'OVERDUE') &&
      isWithinInterval(inv.issuedDate, { start: nextMonthStart, end: nextMonthEnd })
    );
    nextMonthIncome = draftPendingInvoicesNextMonth.reduce((sum, inv) => sum + inv.amount, 0);
    nextMonthInvoices = draftPendingInvoicesNextMonth;
    
    // Update forecasted items to only include draft/pending invoices
    nextMonthForecastedItems = draftPendingInvoicesNextMonth.map(inv => ({
      id: inv.id,
      name: `Invoice #${inv.invoiceNumber} (${inv.status})`,
      amount: inv.amount
    }));

    allSubscriptions.forEach(sub => {
        if (sub.billingCycle === 'MONTHLY') {
            lastMonthSubscriptionItems.push(sub);
            thisMonthSubscriptionItems.push(sub);
            nextMonthSubscriptionItems.push(sub);
        } else if (sub.billingCycle === 'ANNUALLY' && sub.dueDate) {
            const syntheticExpense: Expense = {
                id: `sub-${sub.id}`, description: `${sub.name} (Annual)`, amount: sub.amount, date: sub.dueDate, userId: sub.userId, createdAt: sub.createdAt, updatedAt: sub.updatedAt, category: ExpenseCategory.OTHER,
            };
            if (isWithinInterval(sub.dueDate, { start: lastMonthStart, end: lastMonthEnd })) lastMonthExpenseItems.push(syntheticExpense);
            if (isWithinInterval(sub.dueDate, { start: thisMonthStart, end: thisMonthEnd })) thisMonthExpenseItems.push(syntheticExpense);
        }
    });
    
    const nextMonthOneTimeExpenses = allExpenses.filter(exp => isWithinInterval(exp.date, { start: nextMonthStart, end: nextMonthEnd }));
    nextMonthExpenseItems = nextMonthOneTimeExpenses;

    lastMonthExpenses = lastMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    thisMonthExpenses = thisMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);
    nextMonthExpenses = nextMonthExpenseItems.reduce((sum, exp) => sum + exp.amount, 0);

    lastMonthSubscriptionsTotal = lastMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    thisMonthSubscriptionsTotal = thisMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);
    nextMonthSubscriptionsTotal = nextMonthSubscriptionItems.reduce((sum, s) => sum + s.amount, 0);

    totalLastMonthExpensesForNet = lastMonthExpenses + lastMonthSubscriptionsTotal;
    totalThisMonthExpensesForNet = thisMonthExpenses + thisMonthSubscriptionsTotal;
    totalNextMonthExpensesForNet = nextMonthExpenses + nextMonthSubscriptionsTotal;

    lastMonthNet = lastMonthIncome - (lastMonthIncome * 0.20) - totalLastMonthExpensesForNet;
    thisMonthNet = thisMonthIncome - (thisMonthIncome * 0.20) - totalThisMonthExpensesForNet;
    nextMonthNet = nextMonthIncome - (nextMonthIncome * 0.20) - totalNextMonthExpensesForNet;
    
    // Fetch alerts data
    // 1. Overdue invoices: DRAFT or PENDING status past due date
    overdueInvoices = allInvoices.filter(inv => {
      if (!inv.dueDate) return false;
      const isPastDue = isBefore(inv.dueDate, today);
      const isUnpaid = inv.status === 'DRAFT' || inv.status === 'PENDING';
      return isPastDue && isUnpaid;
    });
    
    // 2. Upcoming subscription renewals (next 7 days)
    const sevenDaysFromNow = addDays(today, 7);
    upcomingSubscriptions = allSubscriptions.filter(sub => {
      if (sub.billingCycle === 'MONTHLY') {
        // Monthly subscriptions always renew, so include them
        return true;
      } else if (sub.billingCycle === 'ANNUALLY' && sub.dueDate) {
        // Annual subscriptions due in next 7 days
        return isWithinInterval(sub.dueDate, { start: today, end: sevenDaysFromNow });
      }
      return false;
    });
    
    // 3. Low cash flow warning: current month expenses exceed income
    isLowCashFlow = thisMonthNet < 0;
  }


  return (
    <FinancialsClientWrapper
      chartData={chartData}
      totalRevenue={totalRevenue}
      totalExpensesYTD={totalExpensesYTD}
      totalSubscriptionsYTD={totalSubscriptionsYTD}
      netIncomeYTD={netIncomeYTD}
      totalTaxesDue={totalTaxesDue}
      upcomingPayments={upcomingPayments}
      lastMonthIncome={lastMonthIncome}
      thisMonthIncome={thisMonthIncome}
      nextMonthIncome={nextMonthIncome}
      totalLastMonthExpensesForNet={totalLastMonthExpensesForNet}
      totalThisMonthExpensesForNet={totalThisMonthExpensesForNet}
      totalNextMonthExpensesForNet={totalNextMonthExpensesForNet}
      lastMonthNet={lastMonthNet}
      thisMonthNet={thisMonthNet}
      nextMonthNet={nextMonthNet}
      lastMonthInvoices={lastMonthInvoices}
      thisMonthInvoices={thisMonthInvoices}
      nextMonthInvoices={nextMonthInvoices}
      lastMonthExpenseItems={lastMonthExpenseItems}
      thisMonthExpenseItems={thisMonthExpenseItems}
      nextMonthExpenseItems={nextMonthExpenseItems}
      lastMonthSubscriptionItems={lastMonthSubscriptionItems}
      thisMonthSubscriptionItems={thisMonthSubscriptionItems}
      nextMonthSubscriptionItems={nextMonthSubscriptionItems}
      nextMonthForecastedItems={nextMonthForecastedItems}
      overdueInvoices={overdueInvoices}
      upcomingSubscriptions={upcomingSubscriptions}
      isLowCashFlow={isLowCashFlow}
    />
  );
}