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
import ContactForm from "./components/ContactForm";

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

// Define types based on the actual schema.prisma
type Invoice = {
  amount: number;
  updatedAt: Date;
  status: 'PAID' | 'DRAFT' | 'PENDING' | 'OVERDUE';
};

type Expense = {
  amount: number;
  date: Date;
};

type Subscription = {
  amount: number;
  billingCycle: 'MONTHLY' | 'ANNUALLY';
  createdAt: Date;
};

// --- HELPER TYPES for recent activity ---
type RecentProject = { id: string; name: string; createdAt: Date };
type RecentTask = { id: string; title: string; createdAt: Date };

// --- HELPER FUNCTION for fetching monthly activity ---
async function getActivityForPeriod(userId: string, startDate: Date, endDate: Date): Promise<MonthlyActivity[]> {
  const [projects, timelineEvents] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId, endDate: { gte: startDate, lte: endDate } },
      select: { id: true, name: true, endDate: true },
    }),
    prisma.timelineEvent.findMany({
      where: {
        project: { ownerId: userId },
        eventDate: { gte: startDate, lte: endDate },
        isCompleted: false
      },
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

// --- REVISED: This function now correctly initializes data points and handles the forecast ---
function processFinancialDataForThreeMonths(invoices: Invoice[], expenses: Expense[], subscriptions: Subscription[], forecastValue: number): ChartDataPoint[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  const lastMonthDate = new Date(currentYear, currentMonth - 1);
  const thisMonthDate = new Date(currentYear, currentMonth);
  const nextMonthDate = new Date(currentYear, currentMonth + 1);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData: ChartDataPoint[] = [
    { month: monthNames[lastMonthDate.getMonth()], revenue: 0, expenses: 0, netIncome: 0, forecast: 0 },
    { month: monthNames[thisMonthDate.getMonth()], revenue: 0, expenses: 0, netIncome: 0, forecast: 0 },
    { month: monthNames[nextMonthDate.getMonth()], revenue: 0, expenses: 0, netIncome: 0, forecast: 0 },
  ];

  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.updatedAt);
    if (invoiceDate.getFullYear() === lastMonthDate.getFullYear() && invoiceDate.getMonth() === lastMonthDate.getMonth()) {
      monthlyData[0].revenue += invoice.amount;
    } else if (invoiceDate.getFullYear() === thisMonthDate.getFullYear() && invoiceDate.getMonth() === thisMonthDate.getMonth()) {
      monthlyData[1].revenue += invoice.amount;
    }
  });

  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === lastMonthDate.getFullYear() && expenseDate.getMonth() === lastMonthDate.getMonth()) {
      monthlyData[0].expenses += expense.amount;
    } else if (expenseDate.getFullYear() === thisMonthDate.getFullYear() && expenseDate.getMonth() === thisMonthDate.getMonth()) {
      monthlyData[1].expenses += expense.amount;
    }
  });

  subscriptions.forEach(sub => {
    const subStartDate = new Date(sub.createdAt);
    [lastMonthDate, thisMonthDate, nextMonthDate].forEach((date, index) => {
      const monthToCheck = date.getMonth();
      const yearToCheck = date.getFullYear();

      if (yearToCheck > subStartDate.getFullYear() || (yearToCheck === subStartDate.getFullYear() && monthToCheck >= subStartDate.getMonth())) {
        if (sub.billingCycle === 'MONTHLY') {
          monthlyData[index].expenses += sub.amount;
        } else if (sub.billingCycle === 'ANNUALLY' && monthToCheck === subStartDate.getMonth()) {
          monthlyData[index].expenses += sub.amount;
        }
      }
    });
  });

  monthlyData[1].forecast = 0;
  monthlyData[2].forecast = forecastValue;
  monthlyData[2].revenue = forecastValue;

  monthlyData.forEach(data => {
    data.netIncome = data.revenue - data.expenses;
  });

  return monthlyData;
}


export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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
    prisma.invoice.findMany({
      where: { userId: userId, status: 'PAID', updatedAt: { gte: startDate } },
      select: { amount: true, updatedAt: true, status: true }
    }) as Promise<Invoice[]>,
    prisma.expense.findMany({
      where: { userId: userId, date: { gte: startDate } },
      select: { amount: true, date: true }
    }) as Promise<Expense[]>,
    prisma.subscription.findMany({
      where: { userId: userId },
      select: { amount: true, billingCycle: true, createdAt: true }
    }) as Promise<Subscription[]>,
    prisma.project.aggregate({
      where: { ownerId: userId },
      _sum: { projectValue: true },
    }),
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
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)),
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)),
    getActivityForPeriod(userId, new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999)),
  ]);

  const forecastValue = projectForecast._sum.projectValue ?? 0;

  const financialChartData = processFinancialDataForThreeMonths(paidInvoices, oneTimeExpenses, subscriptions, forecastValue);

  const recentActivity = [
    ...recentProjects.map((p: RecentProject) => ({ ...p, type: 'Project', title: p.name, date: p.createdAt })),
    ...recentTasks.map((t: RecentTask) => ({ ...t, type: 'Task', title: t.title, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    // ✅ MODIFIED: Added the main grid layout for the two-column structure
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6">
      
      {/* --- Main Content Column (2/3 width) --- */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 mb-6">
          <FinancialOverviewChart data={financialChartData} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
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

        <div className="grid gap-6 md:grid-cols-2">
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
        
        <ContactForm />
      </div>

      {/* --- Sticky Sidebar Column (1/3 width) --- */}
      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-6 lg:self-start">
        <FeatureRequests />
      </div>
    </div>
  )
}
