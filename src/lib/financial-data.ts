import { prisma } from '@/lib/prisma';
import { type Invoice, type Expense, type Subscription, type Client, ContractTerm } from "@prisma/client";
import { subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, addDays, startOfYear, getMonth, getYear, parseISO, isBefore, isAfter, isEqual } from "date-fns";

export interface FinancialTrendsDataPoint {
  month: string;
  totalRevenue: number;
  expenses: number;
  subscriptions: number;
  netIncome: number;
  taxesDue: number;
  upcomingPayments: number;
  forecast: number;
}

type ClientWithContracts = Client;

const getMonthsFromTerm = (term: ContractTerm): number => {
  switch (term) {
    case ContractTerm.ONE_MONTH: return 1;
    case ContractTerm.THREE_MONTH: return 3;
    case ContractTerm.SIX_MONTH: return 6;
    case ContractTerm.ONE_YEAR: return 12;
    default: return 0;
  }
};

const processDataForChart = (
  invoices: Invoice[],
  expenses: Expense[],
  subscriptions: Subscription[],
  clients: ClientWithContracts[]
): FinancialTrendsDataPoint[] => {
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonthIndex = getMonth(now);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Initialize monthly data (NOT cumulative)
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: monthNames[i],
    totalRevenue: 0,
    expenses: 0,
    subscriptions: 0,
    netIncome: 0,
    taxesDue: 0,
    upcomingPayments: 0,
    forecast: 0,
  }));

  // 1. REVENUE: Sum of PAID invoices for each month
  invoices.forEach(inv => {
    if (inv.status === 'PAID' && getYear(inv.issuedDate) === currentYear) {
      const monthIndex = getMonth(inv.issuedDate);
      monthlyData[monthIndex].totalRevenue += inv.amount;
    }
  });

  // 2. FORECAST REVENUE: Sum of DRAFT, PENDING, and OVERDUE invoices for each month
  invoices.forEach(inv => {
    if ((inv.status === 'DRAFT' || inv.status === 'PENDING' || inv.status === 'OVERDUE') 
        && getYear(inv.issuedDate) === currentYear) {
      const monthIndex = getMonth(inv.issuedDate);
      monthlyData[monthIndex].forecast += inv.amount; // Start with unpaid invoice revenue
    }
  });

  // 3. ONE-TIME EXPENSES: Process expenses for each month
  expenses.forEach(exp => {
    if (getYear(exp.date) === currentYear) {
      const monthIndex = getMonth(exp.date);
      monthlyData[monthIndex].expenses += exp.amount;
    }
  });

  // 4. SUBSCRIPTIONS: Calculate monthly subscription total
  const monthlySubscriptionTotal = subscriptions
    .filter(s => s.billingCycle === 'MONTHLY')
    .reduce((sum, s) => sum + s.amount, 0);

  // Add annual subscriptions to their due month
  subscriptions.forEach(sub => {
    if (sub.billingCycle === 'ANNUALLY' && sub.dueDate && getYear(sub.dueDate) === currentYear) {
      const monthIndex = getMonth(sub.dueDate);
      // Add to both expenses and subscriptions for the month it's due
      monthlyData[monthIndex].expenses += sub.amount;
      monthlyData[monthIndex].subscriptions += sub.amount;
    }
  });

  // 5. Process each month
  for (let i = 0; i < 12; i++) {
    // Add monthly subscriptions to every month up to and including current month
    if (i <= currentMonthIndex) {
      monthlyData[i].expenses += monthlySubscriptionTotal;
      monthlyData[i].subscriptions += monthlySubscriptionTotal;
    }

    // For current and future months, add forecasted revenue from contracts
    if (i >= currentMonthIndex) {
      let forecastedClientIncome = 0;
      const forecastMonthStart = new Date(currentYear, i, 1);
      const forecastMonthEnd = endOfMonth(forecastMonthStart);

      clients.forEach(client => {
        if (client.contractStartDate && client.contractAmount && client.contractTerm && client.frequency === '1 Month') {
          const startDate = parseISO(client.contractStartDate.toString());
          const termsInMonths = getMonthsFromTerm(client.contractTerm);
          const endDate = addMonths(startDate, termsInMonths);

          if (!isAfter(forecastMonthStart, endDate) && !isBefore(forecastMonthEnd, startDate)) {
            forecastedClientIncome += client.contractAmount;
          }
        }
      });
      
      monthlyData[i].totalRevenue += forecastedClientIncome;

      // Add monthly subscriptions to future months as well
      if (i > currentMonthIndex) {
        monthlyData[i].expenses += monthlySubscriptionTotal;
        monthlyData[i].subscriptions += monthlySubscriptionTotal;
      }
    }

    // 6. TAXES DUE: 20% of revenue for that month
    monthlyData[i].taxesDue = monthlyData[i].totalRevenue * 0.20;

    // 7. NET INCOME: Revenue - taxes - expenses (expenses already includes all subscriptions)
    monthlyData[i].netIncome = monthlyData[i].totalRevenue - monthlyData[i].taxesDue - monthlyData[i].expenses;

    // 8. UPCOMING PAYMENTS: Same as subscriptions (monthly + annual due that month)
    monthlyData[i].upcomingPayments = monthlyData[i].subscriptions;

    // 9. FORECAST: Unpaid invoices minus all expenses
    // Forecast = (DRAFT + PENDING + OVERDUE invoices) - one-time expenses - subscriptions
    monthlyData[i].forecast = monthlyData[i].forecast - monthlyData[i].expenses;
  }

  // Return data up to current month + 3 months forecast
  return monthlyData.slice(0, Math.min(currentMonthIndex + 4, 12));
};

export async function getFinancialTrendsData(year?: number): Promise<FinancialTrendsDataPoint[]> {
  const currentYear = year || new Date().getFullYear();
  const startDateYTD = startOfYear(new Date(currentYear, 0, 1));

  // Fetch all required data
  const [
    allInvoices, 
    allExpenses, 
    allSubscriptions,
    allClients
  ] = await Promise.all([
    prisma.invoice.findMany({ 
      where: { issuedDate: { gte: startDateYTD } },
      include: { client: { select: { name: true } } }
    }),
    prisma.expense.findMany({ where: { date: { gte: startDateYTD } } }),
    prisma.subscription.findMany(),
    prisma.client.findMany()
  ]);

  // Process and return the chart data
  return processDataForChart(allInvoices, allExpenses, allSubscriptions, allClients);
}