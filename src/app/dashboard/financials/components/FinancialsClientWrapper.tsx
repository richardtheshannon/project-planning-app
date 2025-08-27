'use client';

import React from 'react';
import { type Invoice, type Expense, type Subscription, type Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, BarChart2, Plus, Upload, ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import { CloseableNotification } from "@/components/ui/closeable-notification";
import { MetricCard } from "@/components/ui/metric-card";
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
  const notificationSettings = useCloseableNotifications();

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
          message="This chart displays monthly financial trends including revenue, expenses, and net income. Revenue data comes from paid invoices, while expenses include both one-time costs and recurring subscriptions. The forecast shows projected income and expenses for future months."
          type="info"
          isEnabled={notificationSettings.enableCloseableNotifications}
          closedNotifications={notificationSettings.closedNotifications}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Revenue (YTD)"
          value={totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of all revenue this year"
          trend={{ value: '+12%', isPositive: true }}
          notification={{
            id: 'revenue-ytd-logic',
            message: 'Total Revenue includes only invoices marked as "PAID". Draft, pending, and overdue invoices are not included.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Expenses (YTD)"
          value={totalExpensesYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of one-time expenses, annual subs, & monthly subs x12"
          notification={{
            id: 'expenses-ytd-logic',
            message: 'Expenses include one-time costs plus all subscription costs. Monthly subscriptions are multiplied by 12.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Subscriptions (YTD)"
          value={totalSubscriptionsYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Annual subscriptions plus monthly subscriptions x12"
          notification={{
            id: 'subscriptions-logic',
            message: 'This represents the total annual cost of all subscriptions. Monthly subscriptions are annualized.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Net Income (YTD)"
          value={netIncomeYTD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Revenue minus taxes & all YTD expenses (not annualized subs)"
          trend={{ value: netIncomeYTD > 0 ? '+5%' : '-5%', isPositive: netIncomeYTD > 0 }}
          notification={{
            id: 'net-income-logic',
            message: 'Net Income = Total Revenue - Tax Liability (20%) - All Expenses. Uses actual YTD costs.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Total Taxes Due (YTD)"
          value={totalTaxesDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Calculated at 20% of Total Revenue"
          notification={{
            id: 'taxes-logic',
            message: 'Tax calculation uses a simplified 20% rate. Actual tax rates vary by location and income level.',
            type: 'warning'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Upcoming Payments"
          value={upcomingPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Sum of monthly subs + annual subs due in next 30 days"
          notification={{
            id: 'upcoming-payments-logic',
            message: 'Shows subscription payments due within the next 30 days. Includes all monthly subscriptions plus any annual renewals.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Last Month"
          value={lastMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${lastMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalLastMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: lastMonthNet > 0 ? '+' + Math.abs(lastMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(lastMonthNet/1000).toFixed(1) + 'k', isPositive: lastMonthNet > 0 }}
          notification={{
            id: 'last-month-summary',
            message: 'Monthly summaries show income from invoices issued that month, expenses incurred, and net income after 20% tax provision. Net = Income - (Income × 0.20) - Expenses.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="This Month"
          value={thisMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${thisMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalThisMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: thisMonthNet > 0 ? '+' + Math.abs(thisMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(thisMonthNet/1000).toFixed(1) + 'k', isPositive: thisMonthNet > 0 }}
          notificationSettings={notificationSettings}
        />
        <MetricCard
          title="Next Month (Forecast)"
          value={nextMonthNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          subtitle="Summary of financial activity"
          description={`Income: ${nextMonthIncome.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} | Expenses: ${totalNextMonthExpensesForNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          trend={{ value: nextMonthNet > 0 ? '+' + Math.abs(nextMonthNet/1000).toFixed(1) + 'k' : '-' + Math.abs(nextMonthNet/1000).toFixed(1) + 'k', isPositive: nextMonthNet > 0 }}
          notification={{
            id: 'next-month-forecast',
            message: 'Forecast income includes recurring client contracts and scheduled invoices. Projected expenses include known recurring costs and planned one-time expenses. Actual results may vary.',
            type: 'info'
          }}
          notificationSettings={notificationSettings}
        />
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
              isEnabled={notificationSettings.enableCloseableNotifications}
              closedNotifications={notificationSettings.closedNotifications}
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
              isEnabled={notificationSettings.enableCloseableNotifications}
              closedNotifications={notificationSettings.closedNotifications}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}