import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import FeatureRequests from "./FeatureRequests" // Import the new component
import { FolderKanban, CheckCircle2 } from 'lucide-react'; // Import icons

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;

  // Fetch stats
  const projectCount = await prisma.project.count({ where: { ownerId: userId } });
  const activeTaskCount = await prisma.task.count({ where: { project: { ownerId: userId }, status: { not: 'COMPLETED' } } });
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const completedThisWeekCount = await prisma.task.count({ where: { project: { ownerId: userId }, status: 'COMPLETED', updatedAt: { gte: oneWeekAgo } } });

  // --- START: New Recent Activity Logic ---

  // 1. Fetch recent projects and tasks
  const recentProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, name: true, createdAt: true }
  });

  const recentTasks = await prisma.task.findMany({
    where: { project: { ownerId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, title: true, createdAt: true, projectId: true }
  });

  // 2. Combine and type-cast the activities
  const activities = [
    ...recentProjects.map(p => ({ ...p, type: 'Project' as const, title: p.name, date: p.createdAt })),
    ...recentTasks.map(t => ({ ...t, type: 'Task' as const, date: t.createdAt }))
  ];

  // 3. Sort all activities by date and take the top 3
  const recentActivity = activities
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);
    
  // --- END: New Recent Activity Logic ---

  return (
    <>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectCount}</div>
              <p className="text-xs text-muted-foreground">{projectCount === 1 ? '1 project' : `${projectCount} total projects`}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTaskCount}</div>
              <p className="text-xs text-muted-foreground">{activeTaskCount === 1 ? '1 active task' : `${activeTaskCount} active tasks`}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedThisWeekCount}</div>
              <p className="text-xs text-muted-foreground">{completedThisWeekCount === 1 ? '1 task completed' : `${completedThisWeekCount} tasks completed`}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/projects/new" className="block">
                <Button className="w-full justify-start">Create New Project</Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>Add Task</Button>
              <Link href="/dashboard/projects" className="block">
                <Button variant="outline" className="w-full justify-start">View All Projects</Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Updated Recent Activity Card */}
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.type === 'Project' ? 'New Project:' : 'New Task:'} {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No recent activity</p>
                  <p className="text-sm">Start by creating your first project!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="px-4 pb-6 sm:px-0">
        <FeatureRequests />
      </div>
    </>
  )
}
