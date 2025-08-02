"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    tasks: number
    members: number
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Step 2: Updated badge colors to be theme-aware
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANNING: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ON_HOLD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      MEDIUM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
    return colors[priority] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg">Loading projects...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-lg">Error: {error}</div>
          <Button onClick={fetchProjects} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          {/* Step 1: Replaced hardcoded text colors with theme-aware classes */}
          <h2 className="text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>Create New Project</Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link href="/dashboard/projects/new">
              <Button>Create Your First Project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tasks</span>
                    <span className="font-medium text-foreground">{project._count.tasks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium text-foreground">{project._count.members}</span>
                  </div>

                  {project.endDate && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Due: {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
