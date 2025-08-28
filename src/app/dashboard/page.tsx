// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import MonthlyTimeline from "./MonthlyTimeline";
import { FolderKanban, CheckCircle2, DollarSign, PlusCircle } from 'lucide-react';
import { FinancialTrendsChart } from "@/components/dashboard/FinancialTrendsChart";
import { getFinancialTrendsData, type FinancialTrendsDataPoint } from "@/lib/financial-data";
import ContactForm from "./components/ContactForm";
import QuickActionsCard from "./components/QuickActionsCard";
import { HelpEnabledTitle } from "@/components/ui/help-enabled-title";

// --- TYPE DEFINITIONS ---
export type MonthlyActivity = {
  id: string;
  type: 'Project' | 'TimelineEvent' | 'Task' | 'Invoice' | 'FeatureRequest';
  title: string;
  date: Date;
  isCompleted?: boolean;
  projectId?: string;
  projectName?: string;
  clientName?: string;
  status?: string;
  priority?: string;
  submittedBy?: string;
};


type RecentProject = { id: string; name: string; createdAt: Date };
type RecentTask = { id: string; title: string; createdAt: Date };

// --- DATA FETCHING & PROCESSING FUNCTIONS ---

// Updated to fetch all activity types with consistent filtering
async function getActivityForPeriod(startDate: Date, endDate: Date): Promise<MonthlyActivity[]> {
  const [projects, timelineEvents, tasks, invoices, featureRequests] = await Promise.all([
    // Projects ending in the period
    prisma.project.findMany({ 
      where: { endDate: { gte: startDate, lte: endDate } }, 
      select: { id: true, name: true, endDate: true, status: true, priority: true } 
    }),
    // Timeline events in the period (uncompleted)
    prisma.timelineEvent.findMany({ 
      where: { eventDate: { gte: startDate, lte: endDate }, isCompleted: false }, 
      include: { project: { select: { id: true, name: true } } } 
    }),
    // Tasks due in the period
    prisma.task.findMany({
      where: { dueDate: { gte: startDate, lte: endDate } },
      select: { id: true, title: true, dueDate: true, status: true, priority: true, projectId: true, project: { select: { name: true } } }
    }),
    // Invoices due in the period (only DRAFT/PENDING)
    prisma.invoice.findMany({
      where: { 
        dueDate: { gte: startDate, lte: endDate },
        status: { in: ['DRAFT', 'PENDING'] }
      },
      select: { id: true, invoiceNumber: true, dueDate: true, status: true, client: { select: { name: true } } }
    }),
    // Feature requests due in the period
    prisma.featureRequest.findMany({
      where: { 
        dueDate: { 
          not: null,
          gte: startDate, 
          lte: endDate 
        },
        status: { 
          notIn: ['Done', 'Canceled'] 
        }
      },
      select: { 
        id: true, 
        title: true, 
        dueDate: true, 
        status: true, 
        priority: true,
        submittedBy: true 
      }
    })
  ]);

  const allItems: MonthlyActivity[] = [];

  // Map all item types to MonthlyActivity format
  allItems.push(
    ...projects.filter(p => p.endDate).map(p => ({ 
      id: p.id, 
      type: 'Project' as const, 
      title: p.name, 
      date: p.endDate!, 
      projectId: p.id, 
      projectName: p.name,
      status: p.status,
      priority: p.priority
    })),
    ...timelineEvents.filter(e => e.eventDate).map(e => ({ 
      id: e.id, 
      type: 'TimelineEvent' as const, 
      title: e.title, 
      date: e.eventDate!, 
      isCompleted: e.isCompleted, 
      projectId: e.project.id, 
      projectName: e.project.name 
    })),
    ...tasks.filter(t => t.dueDate).map(t => ({ 
      id: t.id, 
      type: 'Task' as const, 
      title: t.title, 
      date: t.dueDate!, 
      projectId: t.projectId, 
      projectName: t.project.name,
      status: t.status,
      priority: t.priority 
    })),
    ...invoices.filter(i => i.dueDate).map(i => ({ 
      id: i.id, 
      type: 'Invoice' as const, 
      title: `Invoice #${i.invoiceNumber}`, 
      date: i.dueDate!, 
      clientName: i.client.name,
      status: i.status
    })),
    ...featureRequests
      .filter(fr => fr.dueDate !== null)
      .map(fr => ({
        id: `feature-${fr.id}`, 
        type: 'FeatureRequest' as const, 
        title: fr.title, 
        date: new Date(fr.dueDate!),
        priority: fr.priority,
        status: fr.status,
        submittedBy: fr.submittedBy
      }))
  );

  return allItems.sort((a, b) => a.date.getTime() - b.date.getTime());
}


// --- MAIN DASHBOARD SERVER COMPONENT ---
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }
  const now = new Date();

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
    projectForecast, projectCount, activeTaskCount,
    completedThisWeekCount, recentProjects, recentTasks, thisMonthActivity, nextMonthActivity,
    financialChartData
  ] = await Promise.all([
    prisma.project.aggregate({ _sum: { projectValue: true } }),
    prisma.project.count(),
    prisma.task.count({ where: { status: { not: 'COMPLETED' } } }),
    prisma.task.count({ where: { status: 'COMPLETED', updatedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } }),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, name: true, createdAt: true } }),
    prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, title: true, createdAt: true } }),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    getActivityForPeriod(new Date(now.getFullYear(), now.getMonth() + 1, 1), new Date(now.getFullYear(), now.getMonth() + 2, 0)),
    getFinancialTrendsData() // New comprehensive financial data
  ]);
  // --- MODIFICATION END ---

  const forecastValue = projectForecast._sum.projectValue ?? 0;
  
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
        
        {/* Financial Trends Chart - Now with comprehensive 7-series data */}
        <div>
          <FinancialTrendsChart 
            data={financialChartData} 
            title="Financial Overview (YTD)"
            description="A year-to-date summary of your revenue, expenses, net income, and draft/pending invoice forecasts."
          />
        </div>
        
        {/* Quick Actions Card - Shows on mobile only, hidden on lg screens */}
        <div className="lg:hidden">
          <QuickActionsCard />
        </div>
        
        {/* Metric Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <HelpEnabledTitle
                title="Total Forecast"
                summary="Represents the sum of all active and pending project values, calculated from project budgets and expected completion dates."
                details={
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Calculation Method</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const totalForecast = await prisma.project.aggregate({
  _sum: { projectValue: true },
  where: {
    status: {
      in: ['ACTIVE', 'PENDING', 'PLANNING']
    }
  }
});`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Included Project Statuses</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>PLANNING: Early stage projects</li>
                        <li>PENDING: Approved but not started</li>
                        <li>ACTIVE: Currently in progress</li>
                      </ul>
                    </div>
                  </div>
                }
                className="text-sm font-medium"
                as="p"
              />
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(forecastValue)}</div><p className="text-xs text-muted-foreground">Total value of all projects.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <HelpEnabledTitle
                title="Total Projects"
                summary="Shows the count of all projects regardless of status. This includes active, completed, and pending projects."
                details={
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Data Query</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const projectCount = await prisma.project.count();

// Counts all projects regardless of status:
// - PLANNING
// - PENDING  
// - ACTIVE
// - COMPLETED
// - CANCELLED`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Usage</h5>
                      <p className="text-sm">This metric provides a complete overview of all projects in the system, helping you track the total scope of work across all stages.</p>
                    </div>
                  </div>
                }
                className="text-sm font-medium"
                as="p"
              />
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{projectCount}</div><p className="text-xs text-muted-foreground">All projects in the system.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <HelpEnabledTitle
                title="Active Tasks"
                summary="Displays tasks currently in progress or pending. Does not include completed or cancelled tasks."
                details={
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Task Selection Criteria</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const activeTasks = await prisma.task.count({
  where: {
    status: {
      not: 'COMPLETED'
    }
  }
});

// Includes tasks with status:
// - PENDING
// - IN_PROGRESS
// - BLOCKED
// Excludes COMPLETED tasks`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Purpose</h5>
                      <p className="text-sm">This metric helps you understand your current workload and tasks that require attention. It's useful for capacity planning and prioritization.</p>
                    </div>
                  </div>
                }
                className="text-sm font-medium"
                as="p"
              />
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{activeTaskCount}</div><p className="text-xs text-muted-foreground">Not yet completed.</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <HelpEnabledTitle
                title="Tasks Completed"
                summary="Shows the total number of tasks marked as completed in the last 7 days."
                details={
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Data Query</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const completedThisWeek = await prisma.task.count({
  where: {
    status: 'COMPLETED',
    updatedAt: {
      gte: new Date(new Date().setDate(new Date().getDate() - 7))
    }
  }
});

// Only counts tasks completed in last 7 days`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Time Window</h5>
                      <p className="text-sm">This metric uses a rolling 7-day window based on the task's <code>updatedAt</code> timestamp when status changed to COMPLETED.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Productivity Tracking</h5>
                      <p className="text-sm">Use this to measure team productivity and completion velocity over recent periods.</p>
                    </div>
                  </div>
                }
                className="text-sm font-medium"
                as="p"
              />
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{completedThisWeekCount}</div><p className="text-xs text-muted-foreground">Completed in the last 7 days.</p></CardContent>
          </Card>
        </div>
        
        
        {/* Monthly Timeline */}
        <MonthlyTimeline thisMonthActivity={thisMonthActivity} nextMonthActivity={nextMonthActivity} />
        
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
            <CardHeader>
              <HelpEnabledTitle
                title="Recent Activity"
                summary="Shows the last 5 recently created projects and tasks combined, sorted by creation date."
                details={
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Data Sources</h5>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Recent Projects: Last 3 projects ordered by <code>createdAt</code></li>
                        <li>Recent Tasks: Last 3 tasks ordered by <code>createdAt</code></li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Processing Logic</h5>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Combine and sort recent items
const recentActivity = [
  ...recentProjects.map(p => ({ 
    ...p, 
    type: 'Project', 
    title: p.name, 
    date: p.createdAt 
  })),
  ...recentTasks.map(t => ({ 
    ...t, 
    type: 'Task', 
    title: t.title, 
    date: t.createdAt 
  }))
].sort((a, b) => b.date.getTime() - a.date.getTime())
 .slice(0, 5); // Show latest 5 items`}
                      </pre>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Display Format</h5>
                      <p className="text-sm">Items are displayed with icons (📁 for projects, ✅ for tasks), titles, and formatted creation dates.</p>
                    </div>
                  </div>
                }
                className="text-xl font-semibold"
                as="h3"
              />
            </CardHeader>
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
