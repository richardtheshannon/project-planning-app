'use client';

import React from 'react';
import { type Invoice, type Expense, type Subscription, type Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { HelpEnabledTitle } from "@/components/ui/help-enabled-title";
import FinancialsLineChart, { FinancialsChartDataPoint } from "./FinancialsLineChart";

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
  nextMonthForecastedItems
}: FinancialsClientWrapperProps) {

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
              summary="This section will automatically display important financial alerts including overdue invoices, upcoming subscription renewals, low cash flow warnings, and payment reminders."
              details={
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Alert Types</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Overdue Invoices:</strong> Invoices past due date with DRAFT/PENDING status</li>
                      <li><strong>Subscription Renewals:</strong> Upcoming automatic charges in next 7 days</li>
                      <li><strong>Low Cash Flow:</strong> When expenses exceed income for current month</li>
                      <li><strong>Payment Reminders:</strong> Manual payments due soon</li>
                      <li><strong>Budget Overruns:</strong> When actual costs exceed planned budgets</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Alert Logic (Future Implementation)</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Overdue invoices
const overdueInvoices = await prisma.invoice.findMany({
  where: {
    dueDate: { lt: new Date() },
    status: { in: ['DRAFT', 'PENDING'] }
  }
});

// Upcoming renewals (next 7 days)
const upcomingRenewals = subscriptions.filter(sub => {
  const renewalDate = calculateNextRenewalDate(sub);
  return isWithinInterval(renewalDate, {
    start: today,
    end: addDays(today, 7)
  });
});

// Cash flow warnings
const isLowCashFlow = thisMonthNet < 0;`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Alert Prioritization</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Critical:</strong> Overdue payments, failed charges</li>
                      <li><strong>Warning:</strong> Low cash flow, approaching due dates</li>
                      <li><strong>Info:</strong> Renewal reminders, budget tracking</li>
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
            <p className="text-muted-foreground">Alerts for overdue invoices and upcoming subscriptions will appear here.</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <HelpEnabledTitle
              title="Income vs. Expense"
              summary="This chart will show a monthly comparison of your income versus expenses, helping you identify trends and make informed financial decisions. Green indicates positive cash flow, red indicates negative cash flow."
              details={
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">Chart Features (Future)</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Bar Chart:</strong> Side-by-side income vs expense bars per month</li>
                      <li><strong>Color Coding:</strong> Green for positive months, red for negative</li>
                      <li><strong>Trend Lines:</strong> Moving averages to show long-term trends</li>
                      <li><strong>Interactive Tooltips:</strong> Detailed breakdown on hover</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Data Visualization</h5>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Chart data structure
const monthlyComparison = monthlyData.map(month => ({
  month: month.name,
  income: month.totalRevenue,
  expenses: month.totalExpenses,
  netIncome: month.totalRevenue - month.totalExpenses,
  cashFlowStatus: month.totalRevenue > month.totalExpenses ? 'positive' : 'negative'
}));

// Visual indicators
if (monthData.netIncome > 0) {
  barColor = 'green'; // Profitable month
} else {
  barColor = 'red';   // Loss month
}`}
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Business Insights</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Seasonal Patterns:</strong> Identify high/low revenue periods</li>
                      <li><strong>Expense Control:</strong> Track expense growth relative to income</li>
                      <li><strong>Cash Flow Planning:</strong> Predict future cash needs</li>
                      <li><strong>Growth Tracking:</strong> Monitor business expansion</li>
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
            <p className="text-muted-foreground">A chart comparing monthly income and expenses will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}