import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  // If no session, redirect to login
  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin');
  }

  const userId = session.user.id;

  // Fetch total projects count
  const projectCount = await prisma.project.count({
    where: {
      ownerId: userId,
    },
  });

  // Fetch active tasks count (tasks that are not 'COMPLETED')
  const activeTaskCount = await prisma.task.count({
    where: {
      project: {
        ownerId: userId,
      },
      status: {
        not: 'COMPLETED',
      },
    },
  });

  // Fetch tasks completed in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const completedThisWeekCount = await prisma.task.count({
    where: {
        project: {
            ownerId: userId,
        },
        status: 'COMPLETED',
        updatedAt: {
            gte: oneWeekAgo,
        },
    },
  });


  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h2>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">
              {projectCount === 1 ? '1 project' : `${projectCount} total projects`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTaskCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeTaskCount === 1 ? '1 active task' : `${activeTaskCount} active tasks`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeekCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedThisWeekCount === 1 ? '1 task completed' : `${completedThisWeekCount} tasks completed`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/projects/new" className="block">
              <Button className="w-full justify-start">
                Create New Project
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              disabled
            >
              Add Task
            </Button>
            
            <Link href="/dashboard/projects" className="block">
              <Button variant="outline" className="w-full justify-start">
                View All Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <p>No recent activity</p>
              <p className="text-sm">Start by creating your first project!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
