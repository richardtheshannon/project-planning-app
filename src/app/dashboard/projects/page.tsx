"use client"

import { useState, useEffect, useMemo } from 'react'
import { useSession } from "next-auth/react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, List, PlusCircle, ArrowUpDown } from 'lucide-react'
import { Project } from '@prisma/client'

// Custom hook to manage state with sessionStorage, corrected for Next.js hydration
function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

type SortKey = keyof Project | '';
type SortDirection = 'ascending' | 'descending';

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useSessionStorage<'card' | 'table'>('projectsViewMode', 'table');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const fetchProjects = async () => {
      if (session) {
        try {
          const response = await fetch('/api/projects')
          if (!response.ok) {
            throw new Error('Failed to fetch projects')
          }
          const data = await response.json()
          setProjects(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
          setLoading(false)
        }
      } else if (session === null) {
        setLoading(false);
      }
    }
    fetchProjects()
  }, [session])

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const sortedProjects = useMemo(() => {
    let sortableItems = [...filteredProjects];
    if (sortConfig.key) {
      // Define the custom order for priorities
      const priorityOrder: { [key: string]: number } = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };

      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'priority') {
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          if (aPriority < bPriority) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aPriority > bPriority) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }

        // Fallback to default sorting for other columns
        const aValue = a[sortConfig.key as keyof Project];
        const bValue = b[sortConfig.key as keyof Project];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProjects, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING': return <Badge variant="outline">Planning</Badge>
      case 'IN_PROGRESS': return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case 'ON_HOLD': return <Badge variant="secondary">On Hold</Badge>
      case 'COMPLETED': return <Badge className="bg-green-500 text-white">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case 'LOW': return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>
        case 'MEDIUM': return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>
        case 'HIGH': return <Badge variant="outline" className="border-orange-500 text-orange-500">High</Badge>
        case 'URGENT': return <Badge variant="destructive">Urgent</Badge>
        default: return <Badge>{priority}</Badge>
    }
  }

  const SortableHeader = ({ sortKey, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2 py-1">
            {children}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    </TableHead>
  );

  if (loading) return <div>Loading projects...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('table')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/dashboard/projects/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          {/* This className connects the table to the styles in globals.css */}
          <Table className="responsive-table">
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="name">Project Name</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <SortableHeader sortKey="priority">Priority</SortableHeader>
                <SortableHeader sortKey="endDate">Due Date</SortableHeader>
                <TableHead>Tasks</TableHead>
                <TableHead>Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjects.map((project) => (
                <TableRow key={project.id}>
                  {/* The data-label attributes provide the labels for the mobile view */}
                  <TableCell data-label="Project Name" className="font-medium">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell data-label="Status">{getStatusBadge(project.status)}</TableCell>
                  <TableCell data-label="Priority">{getPriorityBadge(project.priority)}</TableCell>
                  <TableCell data-label="Due Date">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell data-label="Tasks">0</TableCell>
                  <TableCell data-label="Members">0</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </CardTitle>
                <CardDescription>{project.description?.substring(0, 100)}...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    {getStatusBadge(project.status)}
                    {getPriorityBadge(project.priority)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
