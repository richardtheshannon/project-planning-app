import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import FeatureRequests from "./FeatureRequests"
import MonthlyTimeline from "./MonthlyTimeline"
import { FolderKanban, CheckCircle2 } from 'lucide-react';

// Define a unified activity type to be used by the dashboard and the monthly timeline component.
// This allows us to handle projects, tasks, and events in a single, consistent way.
export type MonthlyActivity = {
  id: string;
  type: 'Project' | 'Task' | 'TimelineEvent';
  title: string;
  date: Date;
  isCompleted?: boolean;
  projectId?: string;
  projectName?: string;
};

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;

  // --- EXISTING STATS FETCHING ---
  const projectCount = await prisma.project.count({ where: { ownerId: userId } });
  const activeTaskCount = await prisma.task.count({ where: { project: { ownerId: userId }, status: { not: 'COMPLETED' } } });
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeekCount = await prisma.task.count({ where: { project: { ownerId: userId }, status: 'COMPLETED', updatedAt: { gte: oneWeekAgo } } });

  // --- EXISTING RECENT ACTIVITY FETCHING ---
  const recentProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, name: true, createdAt: true },
  });

  const recentTasks = await prisma.task.findMany({
    where: { project: { ownerId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, createdAt: true },
  });

  const recentActivity = [
    ...recentProjects.map(p => ({ ...p, type: 'Project', title: p.name, date: p.createdAt })),
    ...recentTasks.map(t => ({ ...t, type: 'Task', title: t.title, date: t.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  // --- NEW: FETCHING ALL ACTIVITY BY MONTH ---

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Define date ranges for the last, current, and next month.
  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const nextMonthStart = new Date(year, month + 1, 1);
  const nextMonthEnd = new Date(year, month + 2, 0, 23, 59, 59, 999);

  // Helper function to fetch all types of activities for a given period.
  const getActivityForPeriod = async (startDate: Date, endDate: Date): Promise<MonthlyActivity[]> => {
    const [projects, tasks, timelineEvents] = await Promise.all([
      // Fetch projects created in the period
      prisma.project.findMany({
        where: { ownerId: userId, createdAt: { gte: startDate, lte: endDate } },
        select: { id: true, name: true, createdAt: true },
      }),
      // Fetch tasks due in the period. NOTE: This assumes tasks have a `dueDate` field.
      prisma.task.findMany({
        where: {
          project: { ownerId: userId },
          dueDate: { gte: startDate, lte: endDate },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
      // Fetch timeline events scheduled in the period
      prisma.timelineEvent.findMany({
        where: {
          project: { ownerId: userId },
          eventDate: { gte: startDate, lte: endDate },
        },
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

    // Map all fetched items to the unified MonthlyActivity structure.
    const mappedProjects: MonthlyActivity[] = projects.map(p => ({
      id: p.id, type: 'Project', title: p.name, date: p.createdAt,
      projectId: p.id, projectName: p.name
    }));
    const mappedTasks: MonthlyActivity[] = tasks.map(t => ({
      id: t.id, type: 'Task', title: t.title, date: t.dueDate!,
      isCompleted: t.status === 'COMPLETED', projectId: t.project.id, projectName: t.project.name
    }));
    const mappedEvents: MonthlyActivity[] = timelineEvents.map(e => ({
      id: e.id, type: 'TimelineEvent', title: e.title, date: e.eventDate!,
      isCompleted: e.isCompleted, projectId: e.project.id, projectName: e.project.name
    }));

    // Combine and sort all activities by date before returning.
    return [...mappedProjects, ...mappedTasks, ...mappedEvents]
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Fetch all activities in parallel for each month.
  const [lastMonthActivity, thisMonthActivity, nextMonthActivity] = await Promise.all([
    getActivityForPeriod(lastMonthStart, lastMonthEnd),
    getActivityForPeriod(thisMonthStart, thisMonthEnd),
    getActivityForPeriod(nextMonthStart, nextMonthEnd),
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Welcome back! Here's what's happening with your projects.
      </p>
      
      {/* --- Top Stats Cards --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      {/* --- NEW: MONTHLY TIMELINE SECTION --- */}
      <MonthlyTimeline 
        lastMonthActivity={lastMonthActivity}
        thisMonthActivity={thisMonthActivity}
        nextMonthActivity={nextMonthActivity}
      />

      {/* --- Quick Actions & Recent Activity --- */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  Create New Project
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/tasks/create">
                  Add Task
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/dashboard/projects">
                  View All Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={`${activity.type}-${activity.id}`} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {activity.type === 'Project' ? (
                          <FolderKanban className="h-5 w-5 text-blue-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.type === 'Project' ? 'New Project:' : 'New Task:'} {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.date.toLocaleDateString()}
                        </p>
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
