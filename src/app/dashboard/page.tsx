import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import FeatureRequests from "./FeatureRequests"
import MonthlyTimeline from "./MonthlyTimeline"
import { FolderKanban, CheckCircle2, DollarSign } from 'lucide-react';
import FinancialOverviewChart, { ChartDataPoint } from "./components/FinancialOverviewChart";

// The unified activity type remains the same.
export type MonthlyActivity = {
  id: string;
  type: 'Project' | 'TimelineEvent';
  title: string;
  date: Date;
  isCompleted?: boolean;
  projectId?: string;
  projectName?: string;
};

// CORRECTED: Define types based on the actual schema.prisma
type Invoice = {
  amount: number;
  updatedAt: Date; // Using updatedAt as a proxy for paidAt
  status: 'PAID' | 'DRAFT' | 'PENDING' | 'OVERDUE';
};

type Expense = {
  amount: number;
  date: Date;
};

type Subscription = {
    amount: number;
    billingCycle: 'MONTHLY' | 'ANNUALLY';
    createdAt: Date; // To know when the subscription started
};


export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;

  // --- FINANCIAL DATA FETCHING (YTD) ---
  const now = new Date();
  // ✅ MODIFIED: Set the start date for fetching data to July 1st of the current year.
  const chartStartDate = new Date(now.getFullYear(), 6, 1); // 6 = July

  // CORRECTED: Fetch all necessary data in parallel, aligning with the new schema
  const [
    paidInvoices,
    oneTimeExpenses,
    subscriptions,
    projectForecast,
    projectCount,
    activeTaskCount,
    completedThisWeekCount,
    recentProjects,
    recentTasks,
    lastMonthActivity,
    thisMonthActivity,
    nextMonthActivity
  ] = await Promise.all([
    // 1. Revenue: Get all PAID invoices updated since July 1st
    prisma.invoice.findMany({
      where: { userId: userId, status: 'PAID', updatedAt: { gte: chartStartDate } },
      select: { amount: true, updatedAt: true, status: true }
    }) as Promise<Invoice[]>,
    // 2. Expenses: Get all one-time expenses since July 1st
    prisma.expense.findMany({
      where: { userId: userId, date: { gte: chartStartDate } },
      select: { amount: true, date: true }
    }) as Promise<Expense[]>,
    // 3. Subscriptions: Get all active subscriptions (we filter by date in the processing function)
    prisma.subscription.findMany({
        where: { userId: userId },
        select: { amount: true, billingCycle: true, createdAt: true }
    }) as Promise<Subscription[]>,
    // 4. Forecast: Aggregate total project value
    prisma.project.aggregate({
      where: { ownerId: userId },
      _sum: { projectValue: true },
    }),
    // --- EXISTING STATS & ACTIVITY FETCHING ---
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.task.count({ where: { project: { ownerId: userId }, status: { not: 'COMPLETED' } } }),
    prisma.task.count({ 
      where: { 
        project: { ownerId: userId }, 
        status: 'COMPLETED', 
        updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } 
      } 
    }),
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.task.findMany({
      where: { project: { ownerId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true },
    }),
    // --- Monthly Activity Fetching ---
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)),
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)),
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999)),
  ]);
  
  const forecastValue = projectForecast._sum.projectValue ?? 0;

  // CORRECTED: Process financial data with the new data structure
  const financialChartData = processFinancialData(paidInvoices, oneTimeExpenses, subscriptions, forecastValue);

  // --- RECENT ACTIVITY PROCESSING ---
  const recentActivity = [
    ...recentProjects.map(p => ({ ...p, type: 'Project', title: p.name, date: p.createdAt })),
    ...recentTasks.map(t => ({ ...t, type: 'Task', title: t.title, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Welcome back! Here's what's happening with your projects.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <FinancialOverviewChart data={financialChartData} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecast</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(forecastValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value of all projects.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">
              Projects owned by you.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTaskCount}</div>
            <p className="text-xs text-muted-foreground">
              Not yet completed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeekCount}</div>
            <p className="text-xs text-muted-foreground">
              Completed in the last 7 days.
            </p>
          </CardContent>
        </Card>
      </div>

      <MonthlyTimeline 
        lastMonthActivity={lastMonthActivity}
        thisMonthActivity={thisMonthActivity}
        nextMonthActivity={nextMonthActivity}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button asChild><Link href="/dashboard/projects/new">Create New Project</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/tasks/create">Add Task</Link></Button>
              <Button asChild variant="ghost"><Link href="/dashboard/projects">View All Projects</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={`${activity.type}-${activity.id}`} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'Project' ? <FolderKanban className="h-5 w-5 text-blue-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.type === 'Project' ? 'New Project:' : 'New Task:'} {activity.title}</p>
                        <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent activity</p>
                  <p className="text-sm">Start by creating your first project!</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 px-4 py-6 sm:px-0">
        <FeatureRequests />
      </div>
    </>
  )
}

// ✅ UPDATED: This function now processes data starting from July.
function processFinancialData(invoices: Invoice[], expenses: Expense[], subscriptions: Subscription[], forecast: number): ChartDataPoint[] {
  const now = new Date();
  const currentMonth = now.getMonth(); // e.g., 7 for August
  const currentYear = now.getFullYear();
  
  const allMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartStartIndex = 6; // July is the 6th index (0-based)

  // If the current month is before our desired start month, return empty data.
  if (currentMonth < chartStartIndex) {
      return [];
  }

  // Initialize data structure only for the visible months (July up to current month).
  const visibleMonthNames = allMonthNames.slice(chartStartIndex, currentMonth + 1);
  const monthlyData: ChartDataPoint[] = visibleMonthNames.map(monthName => ({
    month: monthName,
    revenue: 0,
    expenses: 0,
    netIncome: 0,
    forecast: 0,
  }));

  // Helper to map a global month index (0-11) to our sliced array index (0-n)
  const getRelativeIndex = (monthIndex: number) => monthIndex - chartStartIndex;

  // Process invoices to calculate monthly revenue
  invoices.forEach(invoice => {
    const monthIndex = new Date(invoice.updatedAt).getMonth();
    if (monthIndex >= chartStartIndex) {
        const relativeIndex = getRelativeIndex(monthIndex);
        if(monthlyData[relativeIndex]) monthlyData[relativeIndex].revenue += invoice.amount;
    }
  });

  // Process one-time expenses
  expenses.forEach(expense => {
    const expenseMonth = new Date(expense.date).getMonth();
    if (expenseMonth >= chartStartIndex) {
        const relativeIndex = getRelativeIndex(expenseMonth);
        if(monthlyData[relativeIndex]) monthlyData[relativeIndex].expenses += expense.amount;
    }
  });
  
  // Process subscriptions to add recurring costs
  subscriptions.forEach(sub => {
    const subStart = new Date(sub.createdAt);
    const subStartYear = subStart.getFullYear();
    const subStartMonth = subStart.getMonth();

    if (sub.billingCycle === 'MONTHLY') {
      // Loop through visible months
      for (let i = chartStartIndex; i <= currentMonth; i++) {
        // Check if subscription was active in this month
        if (currentYear > subStartYear || (currentYear === subStartYear && i >= subStartMonth)) {
          const relativeIndex = getRelativeIndex(i);
          if(monthlyData[relativeIndex]) monthlyData[relativeIndex].expenses += sub.amount;
        }
      }
    } else if (sub.billingCycle === 'ANNUALLY') {
      // Add annual cost if it occurred in a visible month
       if (currentYear === subStartYear && subStartMonth >= chartStartIndex) {
         const relativeIndex = getRelativeIndex(subStartMonth);
         if(monthlyData[relativeIndex]) monthlyData[relativeIndex].expenses += sub.amount;
       }
    }
  });

  // Calculate net income for each month
  monthlyData.forEach(data => {
      data.netIncome = data.revenue - data.expenses;
  });
  
  // Apply forecast logic to the last point in our visible data array.
  const lastIndex = monthlyData.length - 1;
  if (lastIndex >= 0) {
      // Set the forecast for the current month
      monthlyData[lastIndex].forecast = forecast;
      // Ensure the previous month is 0 to create the steep line
      if (lastIndex > 0) {
          monthlyData[lastIndex - 1].forecast = 0;
      }
  }

  return monthlyData;
}


async function getActivityForPeriod(userId: string, startDate: Date, endDate: Date): Promise<MonthlyActivity[]> {
  const [projects, timelineEvents] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId, endDate: { gte: startDate, lte: endDate } },
      select: { id: true, name: true, endDate: true },
    }),
    prisma.timelineEvent.findMany({
      where: { project: { ownerId: userId }, eventDate: { gte: startDate, lte: endDate } },
      include: { project: { select: { id: true, name: true } } },
    }),
  ]);

  const mappedProjects: MonthlyActivity[] = projects.map(p => ({
    id: p.id, type: 'Project', title: p.name, date: p.endDate!,
    projectId: p.id, projectName: p.name
  }));

  const mappedEvents: MonthlyActivity[] = timelineEvents.map(e => ({
    id: e.id, type: 'TimelineEvent', title: e.title, date: e.eventDate!,
    isCompleted: e.isCompleted, projectId: e.project.id, projectName: e.project.name
  }));

  return [...mappedProjects, ...mappedEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
};
