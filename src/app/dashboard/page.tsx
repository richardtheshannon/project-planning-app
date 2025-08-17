// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import MonthlyTimeline from "./MonthlyTimeline";
import { FolderKanban, CheckCircle2, DollarSign, PlusCircle } from 'lucide-react';
import FinancialOverviewChart, { ChartDataPoint } from "./components/FinancialOverviewChart";
import ContactForm from "./components/ContactForm";

// --- TYPE DEFINITIONS ---
export type MonthlyActivity = {
  id: string;
  type: 'Project' | 'TimelineEvent';
  title: string;
  date: Date;
  isCompleted?: boolean;
  projectId?: string;
  projectName?: string;
};

type Invoice = { amount: number; updatedAt: Date; status: string; };
type Expense = { amount: number; date: Date; };
type Subscription = { amount: number; billingCycle: string; createdAt: Date; };
type RecentProject = { id: string; name: string; createdAt: Date };
type RecentTask = { id: string; title: string; createdAt: Date };

// --- DATA FETCHING & PROCESSING FUNCTIONS ---
// MODIFIED: Removed the 'userId' parameter to fetch data for all users.
async function getActivityForPeriod(startDate: Date, endDate: Date): Promise<MonthlyActivity[]> {
  const [projects, timelineEvents] = await Promise.all([
    // MODIFIED: Removed 'ownerId' filter
    prisma.project.findMany({ where: { endDate: { gte: startDate, lte: endDate } }, select: { id: true, name: true, endDate: true } }),
    // MODIFIED: Removed 'project: { ownerId }' filter
    prisma.timelineEvent.findMany({ where: { eventDate: { gte: startDate, lte: endDate }, isCompleted: false }, include: { project: { select: { id: true, name: true } } } }),
  ]);

  const mappedProjects: MonthlyActivity[] = projects.filter(p => p.endDate).map(p => ({ id: p.id, type: 'Project', title: p.name, date: p.endDate!, projectId: p.id, projectName: p.name }));
  const mappedEvents: MonthlyActivity[] = timelineEvents.filter(e => e.eventDate).map(e => ({ id: e.id, type: 'TimelineEvent', title: e.title, date: e.eventDate!, isCompleted: e.isCompleted, projectId: e.project.id, projectName: e.project.name }));
  return [...mappedProjects, ...mappedEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
}

function processFinancialDataForThreeMonths(invoices: Invoice[], expenses: Expense[], subscriptions: Subscription[], forecastValue: number): ChartDataPoint[] {
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData: ChartDataPoint[] = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 + i);
    return { month: monthNames[d.getMonth()], revenue: 0, expenses: 0, netIncome: 0, forecast: 0 };
  });

  invoices.forEach(invoice => {
    const monthIndex = (new Date(invoice.updatedAt).getMonth() - (now.getMonth() - 1) + 12) % 12;
    if (monthIndex >= 0 && monthIndex < 3) monthlyData[monthIndex].revenue += invoice.amount;
  });

  expenses.forEach(expense => {
    const monthIndex = (new Date(expense.date).getMonth() - (now.getMonth() - 1) + 12) % 12;
    if (monthIndex >= 0 && monthIndex < 3) monthlyData[monthIndex].expenses += expense.amount;
  });
  
  monthlyData.forEach(md => md.netIncome = md.revenue - md.expenses);
  monthlyData[2].forecast = forecastValue;
  monthlyData[2].revenue = forecastValue; 

  return monthlyData;
}

// --- MAIN DASHBOARD SERVER COMPONENT ---
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // --- MODIFICATION START ---
  // The 'userId' and 'ownerId' filters have been removed from all queries below
  // to fetch data for the entire application.
  const [
    paidInvoices, oneTimeExpenses, subscriptions, projectForecast, projectCount, activeTaskCount,
    completedThisWeekCount, recentProjects, recentTasks, lastMonthActivity, thisMonthActivity, nextMonthActivity
  ] = await Promise.all([
    prisma.invoice.findMany({ where: { status: 'PAID', updatedAt: { gte: lastMonth } }, select: { amount: true, updatedAt: true, status: true } }),
    prisma.expense.findMany({ where: { date: { gte: lastMonth } }, select: { amount: true, date: true } }),
    prisma.subscription.findMany({ select: { amount: true, billingCycle: true, createdAt: true } }),
    prisma.project.aggregate({ _sum: { projectValue: true } }),
    prisma.project.count(),
    prisma.task.count({ where: { status: { not: 'COMPLETED' } } }),
    prisma.task.count({ where: { status: 'COMPLETED', updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, createdAt: true } }),
    prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, createdAt: true } }),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 2, 0)),
  ]);
  // --- MODIFICATION END ---

  const forecastValue = projectForecast._sum.projectValue ?? 0;
  const financialChartData = processFinancialDataForThreeMonths(paidInvoices, oneTimeExpenses, subscriptions, forecastValue);
  const recentActivity = [
    ...recentProjects.map(p => ({ ...p, type: 'Project', title: p.name, date: p.createdAt })),
    ...recentTasks.map(t => ({ ...t, type: 'Task', title: t.title, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2 mb-8">Welcome back! Here's what's happening across the application.</p>
        </div>
        <FinancialOverviewChart data={financialChartData} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Forecast</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(forecastValue)}</div><p className="text-xs text-muted-foreground">Total value of all projects.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Projects</CardTitle><FolderKanban className="h-4 w-4 text-muted-foreground" /></CardHeader>
            {/* MODIFIED: Updated description to reflect all projects */}
            <CardContent><div className="text-2xl font-bold">{projectCount}</div><p className="text-xs text-muted-foreground">All projects in the system.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Tasks</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{activeTaskCount}</div><p className="text-xs text-muted-foreground">Not yet completed.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tasks Completed</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{completedThisWeekCount}</div><p className="text-xs text-muted-foreground">Completed in the last 7 days.</p></CardContent>
          </Card>
        </div>
        <MonthlyTimeline {...{ lastMonthActivity, thisMonthActivity, nextMonthActivity }} />
        <ContactForm />
      </div>
      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Link href="/dashboard/projects/new">
                <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Create New Project</Button>
              </Link>
              <Button asChild variant="outline" className="w-full"><Link href="/dashboard/tasks/create">Add Task</Link></Button>
              <Button asChild variant="ghost" className="w-full"><Link href="/dashboard/projects">View All Projects</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map(activity => (
                  <li key={`${activity.type}-${activity.id}`} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{activity.type === 'Project' ? <FolderKanban className="h-5 w-5 text-blue-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.type === 'Project' ? 'New Project:' : 'New Task:'} {activity.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8"><p>No recent activity</p><p className="text-sm">Start by creating your first project!</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
