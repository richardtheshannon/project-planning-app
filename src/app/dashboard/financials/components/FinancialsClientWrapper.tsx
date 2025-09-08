'use client';

import React from 'react';
import { type Invoice, type Expense, type Subscription, type Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { HelpEnabledTitle } from "@/components/ui/help-enabled-title";
import FinancialsLineChart, { FinancialsChartDataPoint } from "./FinancialsLineChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type InvoiceWithClient = Prisma.InvoiceGetPayload<{
  include: { client: { select: { name: true } } }
}>;

interface ForecastedItem {
  id: string;
  name: string;
  amount: number;
}

interface FinancialsClientWrapperProps {
  chartData: FinancialsChartDataPoint[];
  totalRevenue: number;
  totalExpensesYTD: number;
  totalSubscriptionsYTD: number;
  netIncomeYTD: number;
  totalTaxesDue: number;
  upcomingPayments: number;
  lastMonthIncome: number;
  thisMonthIncome: number;
  nextMonthIncome: number;
  totalLastMonthExpensesForNet: number;
  totalThisMonthExpensesForNet: number;
  totalNextMonthExpensesForNet: number;
  lastMonthNet: number;
  thisMonthNet: number;
  nextMonthNet: number;
  lastMonthInvoices: InvoiceWithClient[];
  thisMonthInvoices: InvoiceWithClient[];
  nextMonthInvoices: InvoiceWithClient[];
  lastMonthExpenseItems: Expense[];
  thisMonthExpenseItems: Expense[];
  nextMonthExpenseItems: Expense[];
  lastMonthSubscriptionItems: Subscription[];
  thisMonthSubscriptionItems: Subscription[];
  nextMonthSubscriptionItems: Subscription[];
  nextMonthForecastedItems: ForecastedItem[];
  overdueInvoices: InvoiceWithClient[];
  upcomingSubscriptions: Subscription[];
  isLowCashFlow: boolean;
}

export function FinancialsClientWrapper({
  chartData,
  totalRevenue,
  totalExpensesYTD,
  totalSubscriptionsYTD,
  netIncomeYTD,
  totalTaxesDue,
  upcomingPayments,
  lastMonthIncome,
  thisMonthIncome,
  nextMonthIncome,
  totalLastMonthExpensesForNet,
  totalThisMonthExpensesForNet,
  totalNextMonthExpensesForNet,
  lastMonthNet,
  thisMonthNet,
  nextMonthNet,
  lastMonthInvoices,
  thisMonthInvoices,
  nextMonthInvoices,
  lastMonthExpenseItems,
  thisMonthExpenseItems,
  nextMonthExpenseItems,
  lastMonthSubscriptionItems,
  thisMonthSubscriptionItems,
  nextMonthSubscriptionItems,
  nextMonthForecastedItems,
  overdueInvoices,
  upcomingSubscriptions,
  isLowCashFlow
}: FinancialsClientWrapperProps) {

  // Helper function to calculate days overdue
  const getDaysOverdue = (dueDate: Date | null) => {
    if (!dueDate) return 0;
    const today = new Date();
    const diffTime = today.getTime() - new Date(dueDate).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Prepare pie chart data for Income vs. Expense
  const pieChartData = [
    {
      name: 'Revenue (Paid)',
      value: totalRevenue,
      percentage: totalRevenue > 0 || totalExpensesYTD > 0 
        ? ((totalRevenue / (totalRevenue + totalExpensesYTD)) * 100).toFixed(1)
        : '0'
    },
    {
      name: 'Expenses',
      value: totalExpensesYTD,
      percentage: totalRevenue > 0 || totalExpensesYTD > 0
        ? ((totalExpensesYTD / (totalRevenue + totalExpensesYTD)) * 100).toFixed(1)
        : '0'
    }
  ];

  // Colors for pie chart
  const COLORS = ['#10b981', '#ef4444']; // Green for revenue, red for expenses

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">
            {payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        <Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <div className="mb-8">
        <FinancialsLineChart data={chartData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Revenue (YTD)"
          value={totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of all revenue this year"
          trend={{ value: '+12%', isPositive: true }}
          helpDocumentation={{
            summary: 'Total Revenue includes only invoices marked as "PAID". Draft, pending, and overdue invoices are not included.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Revenue Recognition</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const paidInvoicesYTD = await prisma.invoice.findMany({
  where: { 
    status: 'PAID',
    issuedDate: { gte: startOfYear(today) }
  }
});

const totalRevenue = paidInvoicesYTD.reduce(
  (sum, invoice) => sum + invoice.amount, 
  0
);`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Excluded from Revenue</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>DRAFT invoices (not yet sent)</li>
                    <li>PENDING invoices (sent but not paid)</li>
                    <li>OVERDUE invoices (past due date)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Date Range</h5>
                  <p className="text-sm">Year-to-date calculation from January 1st to current date of the current year.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Expenses (YTD)"
          value={totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of one-time expenses, annual subs, & monthly subs x12"
          helpDocumentation={{
            summary: 'Expenses include one-time costs plus all subscription costs. Monthly subscriptions are multiplied by 12.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Expense Components</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// One-time expenses YTD
const oneTimeExpensesYTD = allExpenses.reduce(
  (sum, expense) => sum + expense.amount, 0
);

// Subscription costs (annualized)
const subscriptionCosts = allSubscriptions.reduce((sum, sub) => {
  if (sub.billingCycle === 'MONTHLY') {
    return sum + (sub.amount * 12); // Annual equivalent
  }
  if (sub.billingCycle === 'ANNUALLY') {
    return sum + sub.amount;
  }
  return sum;
}, 0);

const totalExpensesYTD = oneTimeExpensesYTD + subscriptionCosts;`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Calculation Logic</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>One-time expenses: Actual YTD amounts spent</li>
                    <li>Monthly subscriptions: Current monthly cost × 12</li>
                    <li>Annual subscriptions: Full annual amount</li>
                  </ul>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Subscriptions (YTD)"
          value={totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Annual subscriptions plus monthly subscriptions x12"
          helpDocumentation={{
            summary: 'This represents the total annual cost of all subscriptions. Monthly subscriptions are annualized.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Subscription Calculation</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const totalSubscriptionsYTD = allSubscriptions.reduce((sum, sub) => {
  if (sub.billingCycle === 'MONTHLY') {
    return sum + (sub.amount * 12); // Annualize monthly
  }
  if (sub.billingCycle === 'ANNUALLY') {
    return sum + sub.amount; // Already annual
  }
  if (sub.billingCycle === 'QUARTERLY') {
    return sum + (sub.amount * 4); // Annualize quarterly
  }
  return sum;
}, 0);`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Billing Cycle Handling</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Monthly:</strong> Amount × 12 months</li>
                    <li><strong>Quarterly:</strong> Amount × 4 quarters</li>
                    <li><strong>Annual:</strong> Amount as-is</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Purpose</h5>
                  <p className="text-sm">Provides standardized annual view of subscription costs for budgeting and forecasting.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Net Income (YTD)"
          value={netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Revenue minus taxes & all YTD expenses (not annualized subs)"
          trend={{ value: netIncomeYTD > 0 ? '+5%' : '-5%', isPositive: netIncomeYTD > 0 }}
          helpDocumentation={{
            summary: 'Net Income = Total Revenue - Tax Liability (20%) - All Expenses. Uses actual YTD costs.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Net Income Formula</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Calculate net income
const totalTaxesDue = totalRevenue * 0.20; // 20% tax rate
const netIncomeYTD = totalRevenue - totalTaxesDue - totalExpensesYTD;

// Components:
// - totalRevenue: Only PAID invoices YTD
// - totalTaxesDue: 20% of revenue
// - totalExpensesYTD: One-time + subscription costs YTD`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Tax Calculation</h5>
                  <p className="text-sm mb-2">Uses simplified 20% tax rate on gross revenue:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>This is an estimate - actual tax rates vary by jurisdiction</li>
                    <li>Real tax calculations should consider deductions</li>
                    <li>Consult tax professional for accurate planning</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Expense Treatment</h5>
                  <p className="text-sm">Uses actual expenses incurred year-to-date, not annualized projections, providing realistic profitability view.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Total Taxes Due (YTD)"
          value={totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Calculated at 20% of Total Revenue"
          helpDocumentation={{
            summary: 'Tax calculation uses a simplified 20% rate. Actual tax rates vary by location and income level.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Tax Calculation</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const totalTaxesDue = totalRevenue * 0.20; // 20% flat rate

// Applied only to PAID invoice revenue
// Does not account for:
// - Business deductions
// - Different tax brackets
// - Local/state tax variations
// - Quarterly payment schedules`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">⚠️ Important Disclaimers</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Simplified Estimate:</strong> Real tax calculations are more complex</li>
                    <li><strong>Consult Professional:</strong> Use actual tax advisor for planning</li>
                    <li><strong>Jurisdiction Varies:</strong> Tax rates differ by location and entity type</li>
                    <li><strong>Deductions Ignored:</strong> Doesn't include business expense deductions</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Purpose</h5>
                  <p className="text-sm">Provides rough estimate for cash flow planning and setting aside tax reserves.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Upcoming Payments"
          value={upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of monthly subs + annual subs due in next 30 days"
          helpDocumentation={{
            summary: 'Shows subscription payments due within the next 30 days. Includes all monthly subscriptions plus any annual renewals.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Payment Calculation</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const upcomingPaymentsEndDate = addDays(today, 30);

// Monthly subscriptions (due every month)
const monthlyTotal = allSubscriptions
  .filter(s => s.billingCycle === 'MONTHLY')
  .reduce((sum, s) => sum + s.amount, 0);

// Annual subscriptions due in next 30 days
const annualDueNext30 = allSubscriptions
  .filter(s => 
    s.billingCycle === 'ANNUALLY' && 
    s.dueDate && 
    isWithinInterval(s.dueDate, { start: today, end: upcomingPaymentsEndDate })
  )
  .reduce((sum, s) => sum + s.amount, 0);

const upcomingPayments = monthlyTotal + annualDueNext30;`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Payment Types Included</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>All Monthly Subscriptions:</strong> Assumed to renew every month</li>
                    <li><strong>Annual Renewals:</strong> Only those with dueDate in next 30 days</li>
                    <li><strong>Quarterly Subscriptions:</strong> If due date falls in range</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Cash Flow Planning</h5>
                  <p className="text-sm">Use this metric to ensure sufficient cash reserves for automatic subscription renewals and planned payments.</p>
                </div>
              </div>
            )
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Last Month"
          value={lastMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalLastMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: lastMonthNet > 0 ? '+' + Math.abs(lastMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(lastMonthNet/1000).toFixed(1) + 'k', isPositive: lastMonthNet > 0 }}
          helpDocumentation={{
            summary: 'Monthly summaries show income from invoices issued that month, expenses incurred, and net income after 20% tax provision. Net = Income - (Income × 0.20) - Expenses.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Monthly Net Calculation</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const lastMonthStart = startOfMonth(subMonths(today, 1));
const lastMonthEnd = endOfMonth(subMonths(today, 1));

// Income: Invoices issued in the month
const lastMonthInvoices = allInvoices.filter(inv => 
  isWithinInterval(inv.issuedDate, { start: lastMonthStart, end: lastMonthEnd })
);
const lastMonthIncome = lastMonthInvoices.reduce(
  (sum, inv) => sum + inv.amount, 0
);

// Expenses: One-time + subscription costs for the month
const lastMonthExpenses = /* one-time expenses */ + /* subscription costs */;

// Net with tax provision
const lastMonthNet = lastMonthIncome - (lastMonthIncome * 0.20) - lastMonthExpenses;`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Time Period Logic</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Income:</strong> Based on invoice issuedDate (not payment date)</li>
                    <li><strong>Expenses:</strong> One-time expenses by date + monthly subscriptions</li>
                    <li><strong>Period:</strong> Full calendar month (1st to last day)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Tax Provision</h5>
                  <p className="text-sm">20% of monthly income is automatically deducted as tax estimate.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="This Month"
          value={thisMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${thisMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalThisMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: thisMonthNet > 0 ? '+' + Math.abs(thisMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(thisMonthNet/1000).toFixed(1) + 'k', isPositive: thisMonthNet > 0 }}
          helpDocumentation={{
            summary: 'Current month financial performance using the same calculation as Last Month, but for the current calendar month.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Current Month Tracking</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const thisMonthStart = startOfMonth(today);
const thisMonthEnd = endOfMonth(today);

// Same logic as Last Month but for current period
const thisMonthIncome = /* invoices issued this month */;
const thisMonthExpenses = /* expenses incurred this month */;
const thisMonthNet = thisMonthIncome - (thisMonthIncome * 0.20) - thisMonthExpenses;`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Real-Time Updates</h5>
                  <p className="text-sm mb-2">This metric updates as new transactions occur during the month:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>New invoices issued increase income</li>
                    <li>New expenses logged increase expense total</li>
                    <li>Net income adjusts automatically</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Month-to-Date Perspective</h5>
                  <p className="text-sm">Shows partial month performance. Compare with Last Month to see trends and monthly targets.</p>
                </div>
              </div>
            )
          }}
        />
        <MetricCard
          title="Next Month (Forecast)"
          value={nextMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${nextMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalNextMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: nextMonthNet > 0 ? '+' + Math.abs(nextMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(nextMonthNet/1000).toFixed(1) + 'k', isPositive: nextMonthNet > 0 }}
          helpDocumentation={{
            summary: 'Forecast income includes recurring client contracts and scheduled invoices. Projected expenses include known recurring costs and planned one-time expenses. Actual results may vary.',
            details: (
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold mb-2">Forecast Income Sources</h5>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Recurring client contracts
let forecastedIncomeNextMonth = 0;
allClients.forEach(client => {
  if (client.contractStartDate && client.contractAmount && 
      client.contractTerm && client.frequency === '1 Month') {
    
    const startDate = parseISO(client.contractStartDate.toString());
    const termsInMonths = getMonthsFromTerm(client.contractTerm);
    const endDate = addMonths(startDate, termsInMonths);
    
    // Check if contract is active during next month
    if (!isAfter(nextMonthStart, endDate) && 
        !isBefore(nextMonthEnd, startDate)) {
      forecastedIncomeNextMonth += client.contractAmount;
    }
  }
});

// Plus any one-off invoices scheduled for next month
const nextMonthIncome = forecastedIncomeNextMonth + scheduledInvoices;`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Forecast Expenses</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Recurring subscriptions:</strong> Monthly subscriptions that auto-renew</li>
                    <li><strong>Scheduled one-time expenses:</strong> Known upcoming costs</li>
                    <li><strong>Annual renewals:</strong> If due dates fall in next month</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">⚠️ Forecast Limitations</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Based on current contracts and schedules</li>
                    <li>Doesn't predict new business or unexpected expenses</li>
                    <li>Client contracts may be cancelled or delayed</li>
                    <li>Use as directional guidance, not precise prediction</li>
                  </ul>
                </div>
              </div>
            )
          }}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <HelpEnabledTitle
              title="Alerts & Notifications"
              summary="Displays real-time financial alerts for overdue invoices, upcoming subscription renewals, and cash flow warnings based on your actual data."
              details={
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Active Alert Types</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Overdue Invoices:</strong> Invoices with DRAFT/PENDING status past their due date</li>
                      <li><strong>Subscription Renewals:</strong> All monthly subscriptions + annual subscriptions due in next 7 days</li>
                      <li><strong>Low Cash Flow:</strong> When current month net income is negative (income - 20% tax - expenses)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Exact Calculation Logic</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// 1. OVERDUE INVOICES DETECTION
overdueInvoices = allInvoices.filter(inv => {
  if (!inv.dueDate) return false;
  const isPastDue = isBefore(inv.dueDate, today);
  const isUnpaid = inv.status === 'DRAFT' || inv.status === 'PENDING';
  return isPastDue && isUnpaid;
});

// Days overdue calculation
const getDaysOverdue = (dueDate) => {
  const diffTime = today.getTime() - new Date(dueDate).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// 2. UPCOMING SUBSCRIPTIONS (Next 7 days)
const sevenDaysFromNow = addDays(today, 7);
upcomingSubscriptions = allSubscriptions.filter(sub => {
  if (sub.billingCycle === 'MONTHLY') {
    return true; // All monthly subs renew every month
  } else if (sub.billingCycle === 'ANNUALLY' && sub.dueDate) {
    // Annual subs only if due in next 7 days
    return isWithinInterval(sub.dueDate, { 
      start: today, 
      end: sevenDaysFromNow 
    });
  }
  return false;
});

// 3. LOW CASH FLOW WARNING
const thisMonthNet = thisMonthIncome - (thisMonthIncome * 0.20) - totalThisMonthExpenses;
isLowCashFlow = thisMonthNet < 0;`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Display Logic</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Overdue Invoices:</strong> Shows up to 3 invoices with invoice #, client, amount, and days overdue</li>
                      <li><strong>Subscriptions:</strong> Lists up to 3 upcoming renewals with name, cycle, and amount</li>
                      <li><strong>Cash Flow:</strong> Red alert box showing actual expense vs income amounts</li>
                      <li><strong>No Alerts:</strong> Displays "All invoices are current and cash flow is healthy" when no issues</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Data Sources</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Pulls from all invoices in the system (not user-specific)</li>
                      <li>Checks all active subscriptions regardless of billing cycle</li>
                      <li>Uses current month's actual income and expense totals</li>
                      <li>Updates automatically when new transactions are added</li>
                    </ul>
                  </div>
                </div>
              }
              className="flex items-center text-xl font-semibold"
              as="h3"
            />
            <AlertTriangle className="ml-2 h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overdue Invoices */}
              {overdueInvoices.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-destructive">Overdue Invoices ({overdueInvoices.length})</h4>
                  <div className="space-y-1">
                    {overdueInvoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">#{invoice.invoiceNumber}</span>
                          {invoice.client?.name && (
                            <span className="text-muted-foreground ml-2">- {invoice.client.name}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${invoice.amount.toLocaleString()}</div>
                          <div className="text-xs text-destructive">
                            {getDaysOverdue(invoice.dueDate)} days overdue
                          </div>
                        </div>
                      </div>
                    ))}
                    {overdueInvoices.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{overdueInvoices.length - 3} more overdue invoices
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Subscription Renewals */}
              {upcomingSubscriptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                    Upcoming Renewals (Next 7 days)
                  </h4>
                  <div className="space-y-1">
                    {upcomingSubscriptions.slice(0, 3).map((subscription) => (
                      <div key={subscription.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{subscription.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({subscription.billingCycle.toLowerCase()})
                          </span>
                        </div>
                        <div className="font-medium">${subscription.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {upcomingSubscriptions.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{upcomingSubscriptions.length - 3} more subscriptions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Low Cash Flow Warning */}
              {isLowCashFlow && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Low Cash Flow Warning</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current month expenses (${totalThisMonthExpensesForNet.toLocaleString()}) 
                        exceed income (${thisMonthIncome.toLocaleString()})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No alerts message */}
              {overdueInvoices.length === 0 && upcomingSubscriptions.length === 0 && !isLowCashFlow && (
                <p className="text-muted-foreground text-sm">
                  No alerts at this time. All invoices are current and cash flow is healthy.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <HelpEnabledTitle
              title="Income vs. Expense (YTD)"
              summary="Pie chart showing the proportion of total revenue (paid invoices only) versus total expenses for the year-to-date period."
              details={
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Exact Calculation Logic</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// 1. REVENUE CALCULATION (Green Slice)
// Only includes PAID invoices from start of year
const paidInvoicesYTD = allInvoices.filter(inv => 
  inv.status === 'PAID' && 
  inv.issuedDate >= startOfYear(today)
);
totalRevenue = paidInvoicesYTD.reduce(
  (sum, invoice) => sum + invoice.amount, 0
);

// 2. EXPENSES CALCULATION (Red Slice)
// One-time expenses YTD
const oneTimeExpensesYTD = allExpenses
  .filter(exp => exp.date >= startOfYear(today))
  .reduce((sum, expense) => sum + expense.amount, 0);

// Annualized subscription costs
const totalSubscriptionsYTD = allSubscriptions.reduce((sum, sub) => {
  if (sub.billingCycle === 'MONTHLY') 
    return sum + (sub.amount * 12); // Monthly × 12
  if (sub.billingCycle === 'ANNUALLY') 
    return sum + sub.amount; // Annual as-is
  return sum;
}, 0);

totalExpensesYTD = oneTimeExpensesYTD + totalSubscriptionsYTD;

// 3. PIE CHART DATA PREPARATION
const pieChartData = [
  {
    name: 'Revenue (Paid)',
    value: totalRevenue,
    percentage: totalRevenue > 0 || totalExpensesYTD > 0 
      ? ((totalRevenue / (totalRevenue + totalExpensesYTD)) * 100).toFixed(1)
      : '0'
  },
  {
    name: 'Expenses',
    value: totalExpensesYTD,
    percentage: totalRevenue > 0 || totalExpensesYTD > 0
      ? ((totalExpensesYTD / (totalRevenue + totalExpensesYTD)) * 100).toFixed(1)
      : '0'
  }
];

// 4. NET INCOME CALCULATION (Shown below chart)
const totalTaxesDue = totalRevenue * 0.20; // 20% tax estimate
const netIncomeYTD = totalRevenue - totalTaxesDue - totalExpensesYTD;`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Data Components Breakdown</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Revenue (Green):</strong> Sum of all invoices where status = 'PAID' since Jan 1st</li>
                      <li><strong>Expenses (Red):</strong> All one-time expenses YTD + annualized subscription costs</li>
                      <li><strong>Excluded from Revenue:</strong> DRAFT, PENDING, and OVERDUE invoices</li>
                      <li><strong>Subscription Handling:</strong> Monthly subs × 12, Annual subs × 1</li>
                      <li><strong>Net Income:</strong> Revenue - 20% tax provision - Total expenses</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Visual Components</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Pie Slices:</strong> Proportional representation of revenue vs expenses</li>
                      <li><strong>Percentage Labels:</strong> Shows exact percentage on each slice</li>
                      <li><strong>Color Coding:</strong> Green (#10b981) for revenue, Red (#ef4444) for expenses</li>
                      <li><strong>Hover Tooltip:</strong> Displays dollar amount and percentage on hover</li>
                      <li><strong>Summary Below:</strong> Lists exact amounts for Revenue, Expenses, and Net Income</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Important Notes</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>This is a YTD (Year-to-Date) view, not monthly or quarterly</li>
                      <li>Revenue only counts money actually received (PAID status)</li>
                      <li>Expenses include both actual and projected subscription costs</li>
                      <li>Net Income color changes: green if positive, red if negative</li>
                      <li>Empty state shows when no financial data exists</li>
                    </ul>
                  </div>
                </div>
              }
              className="flex items-center text-xl font-semibold"
              as="h3"
            />
            <BarChart2 className="ml-2 h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {totalRevenue > 0 || totalExpensesYTD > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue (Paid):</span>
                    <span className="font-medium text-green-600 dark:text-green-500">
                      {totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Expenses:</span>
                    <span className="font-medium text-red-600 dark:text-red-500">
                      {totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-muted-foreground">Net Income:</span>
                    <span className={`font-medium ${netIncomeYTD >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No financial data available yet. Start by creating invoices and logging expenses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}