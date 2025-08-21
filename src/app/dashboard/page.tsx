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
import QuickActionsCard from "./components/QuickActionsCard";

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

export type OverdueItem = {
  id: string;
  type: 'Project' | 'TimelineEvent' | 'Invoice' | 'FeatureRequest';
  title: string;
  date: Date;
  status?: string;
  projectId?: string;
  projectName?: string;
  clientName?: string;
  amount?: number;
};

type Invoice = { amount: number; updatedAt: Date; status: string; };
type Expense = { amount: number; date: Date; };
type Subscription = { amount: number; billingCycle: string; createdAt: Date; };
type RecentProject = { id: string; name: string; createdAt: Date };
type RecentTask = { id: string; title: string; createdAt: Date };

// --- DATA FETCHING & PROCESSING FUNCTIONS ---
// New function to fetch overdue items
async function getOverdueItems(): Promise<OverdueItem[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  const [overdueProjects, overdueTimelineEvents, overdueInvoices, overdueFeatureRequests] = await Promise.all([
    // Projects with end date before today
    prisma.project.findMany({
      where: {
        endDate: {
          lt: today
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      },
      select: {
        id: true,
        name: true,
        endDate: true
      }
    }),
    
    // Timeline events before today that are not completed
    prisma.timelineEvent.findMany({
      where: {
        eventDate: {
          lt: today
        },
        isCompleted: false
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),
    
    // Invoices with due date before today marked as DRAFT
    prisma.invoice.findMany({
      where: {
        dueDate: {
          lt: today
        },
        status: 'DRAFT'
      },
      include: {
        client: {
          select: {
            name: true
          }
        }
      }
    }),
    
    // Feature requests with due date before today marked as Pending or In Progress
    prisma.featureRequest.findMany({
      where: {
        dueDate: {
          lt: today
        },
        status: {
          in: ['Pending', 'In Progress']
        }
      }
    })
  ]);

  const overdueItems: OverdueItem[] = [];

  // Map projects
  overdueProjects.forEach(project => {
    if (project.endDate) {
      overdueItems.push({
        id: project.id,
        type: 'Project',
        title: project.name,
        date: project.endDate,
        projectId: project.id,
        projectName: project.name
      });
    }
  });

  // Map timeline events
  overdueTimelineEvents.forEach(event => {
    if (event.eventDate) {
      overdueItems.push({
        id: event.id,
        type: 'TimelineEvent',
        title: event.title,
        date: event.eventDate,
        projectId: event.project.id,
        projectName: event.project.name
      });
    }
  });

  // Map invoices
  overdueInvoices.forEach(invoice => {
    overdueItems.push({
      id: invoice.id,
      type: 'Invoice',
      title: `Invoice ${invoice.invoiceNumber}`,
      date: invoice.dueDate,
      clientName: invoice.client.name || 'Unknown Client',
      amount: invoice.amount,
      status: invoice.status
    });
  });

  // Map feature requests
  overdueFeatureRequests.forEach(request => {
    if (request.dueDate) {
      overdueItems.push({
        id: request.id.toString(),
        type: 'FeatureRequest',
        title: request.title,
        date: request.dueDate,
        status: request.status
      });
    }
  });

  // Sort by date (most overdue first)
  return overdueItems.sort((a, b) => a.date.getTime() - b.date.getTime());
}

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
  
  // Initialize data for 3 months (last month, current month, next month)
  const monthlyData: ChartDataPoint[] = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 + i, 1);
    return { 
      month: monthNames[d.getMonth()], 
      revenue: 0, 
      expenses: 0, 
      netIncome: 0, 
      forecast: 0 
    };
  });

  // Add revenue from paid invoices
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.updatedAt);
    const monthDiff = (invoiceDate.getFullYear() - now.getFullYear()) * 12 + invoiceDate.getMonth() - now.getMonth();
    const monthIndex = monthDiff + 1; // +1 because we start from last month
    
    if (monthIndex >= 0 && monthIndex < 3) {
      monthlyData[monthIndex].revenue += invoice.amount;
    }
  });

  // Add one-time expenses
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthDiff = (expenseDate.getFullYear() - now.getFullYear()) * 12 + expenseDate.getMonth() - now.getMonth();
    const monthIndex = monthDiff + 1; // +1 because we start from last month
    
    if (monthIndex >= 0 && monthIndex < 3) {
      monthlyData[monthIndex].expenses += expense.amount;
    }
  });
  
  // Add subscription costs to each month
  subscriptions.forEach(subscription => {
    // Calculate monthly cost based on billing cycle
    let monthlyCost = 0;
    if (subscription.billingCycle === 'MONTHLY') {
      monthlyCost = subscription.amount;
    } else if (subscription.billingCycle === 'ANNUALLY') {
      monthlyCost = subscription.amount / 12; // Distribute annual cost over 12 months
    } else if (subscription.billingCycle === 'QUARTERLY') {
      monthlyCost = subscription.amount / 3; // Distribute quarterly cost over 3 months
    }
    
    // Add subscription cost to each month in our 3-month window
    // Only add if subscription was created before the end of each month
    const subCreatedDate = new Date(subscription.createdAt);
    
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 1 + i, 1);
      const monthEndDate = new Date(now.getFullYear(), now.getMonth() - 1 + i + 1, 0);
      
      // If subscription was created before the end of this month, include it
      if (subCreatedDate <= monthEndDate) {
        monthlyData[i].expenses += monthlyCost;
      }
    }
  });
  
  // Calculate net income for each month
  monthlyData.forEach(md => {
    md.netIncome = md.revenue - md.expenses;
  });
  
  // Add forecast to the last month (future month)
  monthlyData[2].forecast = forecastValue;
  monthlyData[2].revenue = Math.max(monthlyData[2].revenue, forecastValue); 

  return monthlyData;
}

// --- MAIN DASHBOARD SERVER COMPONENT ---
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  // --- FETCH APPEARANCE SETTINGS FOR BUSINESS NAME AND MISSION STATEMENT ---
  const appearanceSettings = await prisma.appearanceSettings.findFirst({
    select: {
      businessName: true,
      missionStatement: true,  // Fixed: using correct field name
    }
  });

  const businessName = appearanceSettings?.businessName || 'Dashboard';
  const missionStatement = appearanceSettings?.missionStatement || "Welcome back! Here's what's happening across the application.";  // Fixed: using correct field name

  // --- MODIFICATION START ---
  // The 'userId' and 'ownerId' filters have been removed from all queries below
  // to fetch data for the entire application.
  const [
    paidInvoices, oneTimeExpenses, subscriptions, projectForecast, projectCount, activeTaskCount,
    completedThisWeekCount, recentProjects, recentTasks, overdueItems, thisMonthActivity, nextMonthActivity
  ] = await Promise.all([
    // Fetch invoices from the last 3 months
    prisma.invoice.findMany({ 
      where: { 
        status: 'PAID', 
        updatedAt: { gte: threeMonthsAgo } 
      }, 
      select: { amount: true, updatedAt: true, status: true } 
    }),
    // Fetch expenses from the last 3 months
    prisma.expense.findMany({ 
      where: { 
        date: { gte: threeMonthsAgo } 
      }, 
      select: { amount: true, date: true } 
    }),
    // Fetch all active subscriptions
    prisma.subscription.findMany({ 
      select: { amount: true, billingCycle: true, createdAt: true } 
    }),
    prisma.project.aggregate({ _sum: { projectValue: true } }),
    prisma.project.count(),
    prisma.task.count({ where: { status: { not: 'COMPLETED' } } }),
    prisma.task.count({ where: { status: 'COMPLETED', updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, createdAt: true } }),
    prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, createdAt: true } }),
    getOverdueItems(), // Changed from lastMonthActivity to overdueItems
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 2, 0)),
  ]);
  // --- MODIFICATION END ---

  const forecastValue = projectForecast._sum.projectValue ?? 0;
  const financialChartData = processFinancialDataForThreeMonths(paidInvoices, oneTimeExpenses, subscriptions, forecastValue);
  
  // Log the data for debugging
  console.log('Financial Chart Data:', financialChartData);
  console.log('Expenses found:', oneTimeExpenses.length);
  console.log('Subscriptions found:', subscriptions.length);
  
  const recentActivity = [
    ...recentProjects.map(p => ({ ...p, type: 'Project', title: p.name, date: p.createdAt })),
    ...recentTasks.map(t => ({ ...t, type: 'Task', title: t.title, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 p-4 md:p-6">
      {/* Main Content Area */}
      <div className="lg:col-span-2 flex flex-col space-y-8">
        {/* Title Section - Updated to show Business Name and Mission Statement */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{businessName}</h1>
          <p className="text-muted-foreground mt-2 mb-8">{missionStatement}</p>
        </div>
        
        {/* Financial Overview Chart */}
        <FinancialOverviewChart data={financialChartData} />
        
        {/* Quick Actions Card - Shows on mobile only, hidden on lg screens */}
        <div className="lg:hidden">
          <QuickActionsCard />
        </div>
        
        {/* Metric Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
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
        
        {/* Monthly Timeline - Now with overdueItems instead of lastMonthActivity */}
        <MonthlyTimeline overdueItems={overdueItems} thisMonthActivity={thisMonthActivity} nextMonthActivity={nextMonthActivity} />
        
        {/* Contact Form */}
        <ContactForm />
      </div>
      
      <div className="lg:col-span-1 lg:h-screen lg:sticky lg:top-0 flex flex-col lg:justify-center lg:py-6">
        <div className="space-y-8">
          {/* Quick Actions Card - Hidden on mobile, shows on lg screens */}
          <div className="hidden lg:block">
            <QuickActionsCard />
          </div>
          
          {/* Recent Activity Card */}
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
    </div>
  );
}