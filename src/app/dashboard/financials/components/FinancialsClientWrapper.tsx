'use client';

import React from 'react';
import { type Invoice, type Expense, type Subscription, type Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { CloseableNotification } from "@/components/ui/closeable-notification";
import { useCloseableNotifications } from "@/lib/hooks/useCloseableNotifications";
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
  const { enableCloseableNotifications, closedNotifications } = useCloseableNotifications();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
        <Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Log Expense</Button>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <div className="mb-8">
        <FinancialsLineChart data={chartData} />
        <CloseableNotification
          id="financials-chart-logic"
          title="Financial Chart Logic"
          message="This chart displays monthly financial trends including revenue, expenses, and net income. Revenue data comes from paid invoices, while expenses include both one-time costs and recurring subscriptions. The forecast shows projected income and expenses for future months."
          type="info"
          isEnabled={enableCloseableNotifications}
          closedNotifications={closedNotifications}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Sum of all invoices with status 'PAID' this year.</p>
            <CloseableNotification
              id="total-revenue-calculation"
              message="Total Revenue includes only invoices marked as 'PAID'. Draft, pending, and overdue invoices are not included in this calculation but appear in forecasts."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Sum of one-time expenses, annual subs, & monthly subs x12.</p>
            <CloseableNotification
              id="expenses-calculation-method"
              message="Expenses include one-time costs plus all subscription costs. Monthly subscriptions are multiplied by 12 to show the annual impact, while annual subscriptions are counted once."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Annual subscriptions plus monthly subscriptions x12.</p>
            <CloseableNotification
              id="subscriptions-breakdown"
              message="This represents the total annual cost of all subscriptions. Monthly subscriptions are annualized (×12) while annual subscriptions show their yearly cost."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Revenue minus taxes & all YTD expenses (incl. annualized subs).</p>
            <CloseableNotification
              id="net-income-formula"
              message="Net Income = Total Revenue - Tax Liability (20%) - All Expenses. This represents your actual profit after accounting for taxes and all business costs."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Taxes Due (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Calculated as 20% of the Total Revenue (YTD).</p>
            <CloseableNotification
              id="tax-calculation-assumption"
              message="Tax calculation uses a simplified 20% rate. Actual tax rates vary by location, income level, and business structure. Consult your tax professional for accurate calculations."
              type="warning"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
            <p className="text-xs text-muted-foreground">Sum of monthly subs + annual subs due in next 30 days.</p>
            <CloseableNotification
              id="upcoming-payments-timeframe"
              message="Shows subscription payments due within the next 30 days. Includes all monthly subscriptions plus any annual subscriptions with upcoming renewal dates."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Last Month</CardTitle><CardDescription>Summary of financial activity.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowUp className="h-4 w-4 mr-2 text-green-500" />Income</span><span className="font-medium">{lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center"><span className="flex items-center text-sm text-muted-foreground"><ArrowDown className="h-4 w-4 mr-2 text-red-500" />Expenses</span><span className="font-medium">{totalLastMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex justify-between items-center pt-2 border-t"><span className="flex items-center text-sm font-bold"><TrendingUp className="h-4 w-4 mr-2" />Net</span><span className="font-bold">{lastMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <CloseableNotification
              id="monthly-summary-calculation"
              message="Monthly summaries show income from invoices issued that month, expenses incurred, and net income after 20% tax provision. Net = Income - (Income × 0.20) - Expenses."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
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
            <CloseableNotification
              id="forecast-methodology"
              message="Forecast income includes recurring client contracts and scheduled invoices. Projected expenses include known recurring costs and planned one-time expenses. Actual results may vary."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
            <div className="my-4 border-t"></div>
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold">Forecasted Income</h4>
              {nextMonthForecastedItems.length > 0 ? nextMonthForecastedItems.map(item => (<div key={item.id} className="flex justify-between"><span>{item.name}</span><span>{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No forecasted income.</p>}
              <h4 className="font-semibold mt-2">Subscriptions</h4>
              {nextMonthSubscriptionItems.length > 0 ? nextMonthSubscriptionItems.map(sub => (<div key={sub.id} className="flex justify-between"><span>{sub.name}</span><span>{sub.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No subscriptions.</p>}
              <h4 className="font-semibold mt-2">Expenses</h4>
              {nextMonthExpenseItems.length > 0 ? nextMonthExpenseItems.map(exp => (<div key={exp.id} className="flex justify-between"><span>{exp.description}</span><span>{exp.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No expenses.</p>}
              <h4 className="font-semibold mt-2">Invoices</h4>
              {nextMonthInvoices.length > 0 ? nextMonthInvoices.map(inv => (<div key={inv.id} className="flex justify-between"><span>{inv.client.name}</span><span>{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>)) : <p className="text-muted-foreground">No one-off invoices.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive" />Alerts & Notifications</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Alerts for overdue invoices and upcoming subscriptions will appear here.</p>
            <CloseableNotification
              id="alerts-functionality"
              message="This section will automatically display important financial alerts including overdue invoices, upcoming subscription renewals, low cash flow warnings, and payment reminders."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-primary" />Income vs. Expense</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A chart comparing monthly income and expenses will be displayed here.</p>
            <CloseableNotification
              id="income-expense-chart-info"
              message="This chart will show a monthly comparison of your income versus expenses, helping you identify trends and make informed financial decisions. Green indicates positive cash flow, red indicates negative cash flow."
              type="info"
              isEnabled={enableCloseableNotifications}
              closedNotifications={closedNotifications}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}