// src/app/dashboard/projects/[id]/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";
import DocumentsTable from "@/app/dashboard/documents/DocumentsTable";
import { AddContactDialog } from "@/components/projects/AddContactDialog";
import { EditTaskDialog } from "@/components/projects/EditTaskDialog";
import { EditContactDialog } from "@/components/projects/EditContactDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Trash2, ChevronsUpDown, ArrowUp, ArrowDown, Pencil, Link2, ChevronDown, Plus, PlusCircle } from "lucide-react";
import { TimelineSection, TimelineSectionHandle } from "@/components/projects/TimelineSection";
import { Document as PrismaDocument } from '@prisma/client';
// NEW: Import the chart component
import TimelineProgressChart from "@/app/dashboard/components/TimelineProgressChart";


// --- INTERFACES ---
type Document = PrismaDocument;

// NEW: Define TimelineEvent interface for the chart
interface TimelineEvent {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
}

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  projectGoal: string | null;
  website: string | null;
  status: string;
  priority: string;
  projectType: string; // MODIFIED: Added projectType
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  members: {
    id: string;
    name: string | null;
    email: string;
  }[];
  contacts: Contact[];
  tasks: Task[];
  timelineEvents: TimelineEvent[]; // MODIFIED: Added timelineEvents
  _count: {
    tasks: number;
    members: number;
    files: number;
  };
}

type SortKey = 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

type CollapsibleSectionName = 'projectDetails' | 'timelineEvents' | 'tasks' | 'contacts' | 'files';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [openSections, setOpenSections] = useState<Record<CollapsibleSectionName, boolean>>({
    projectDetails: false,
    timelineEvents: true,
    tasks: true,
    contacts: false,
    files: true,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);

  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Partial<Project> | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Task['priority'],
  });

  const timelineSectionRef = useRef<TimelineSectionHandle>(null);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) throw new Error("Project not found.");
      
      const projectData: Project = await projectResponse.json();
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred fetching project data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    try {
      const filesResponse = await fetch(`/api/documents?projectId=${projectId}`);
      if (!filesResponse.ok) throw new Error("Failed to fetch project documents.");
      const filesData: Document[] = await filesResponse.json();
      setDocuments(filesData);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      toast({
        title: "Error",
        description: "Could not load project documents.",
        variant: "destructive",
      });
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchProjectData();
    fetchDocuments();
  }, [fetchProjectData, fetchDocuments]);

  const toggleSection = (sectionName: CollapsibleSectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const CollapsibleHeader = ({ sectionName, title, action }: { sectionName: CollapsibleSectionName, title: string, action?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 md:gap-0">
        <div 
            className="flex items-center gap-3 cursor-pointer flex-grow"
            onClick={() => toggleSection(sectionName)}
        >
            <h3 className="text-xl font-semibold">
                {title}
            </h3>
            <ChevronDown
                size={24}
                className={`text-muted-foreground transition-transform duration-300 ${openSections[sectionName] ? 'rotate-180' : ''}`}
            />
        </div>
        {action && <div className="w-full md:w-auto md:ml-4 flex-shrink-0">{action}</div>}
    </div>
  );

  const handleContactAdded = (newContact: Contact) => {
    setProject(p => p ? { ...p, contacts: [...p.contacts, newContact] } : null);
  };

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete project');
      toast({ title: "Success", description: "Project deleted successfully" });
      router.push('/dashboard/projects');
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast({ title: "Validation Error", description: "Task title is required", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const task = await response.json();
      setProject(p => p ? { ...p, tasks: [...p.tasks, task], _count: {...p._count, tasks: p._count.tasks + 1} } : null);
      toast({ title: "Success", description: "Task created successfully" });
      setShowCreateTaskDialog(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  // MODIFIED: Added projectType to the edit handler
  const handleEditProjectClick = () => {
    if (!project) return;
    setProjectToEdit({
        name: project.name,
        description: project.description,
        projectGoal: project.projectGoal,
        website: project.website,
        status: project.status,
        priority: project.priority,
        projectType: project.projectType,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
    });
    setShowEditProjectDialog(true);
  };

  const handleUpdateProject = async () => {
      if (!projectToEdit || !project) return;
      try {
          const response = await fetch(`/api/projects/${project.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(projectToEdit),
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update project');
          }
          await fetchProjectData();
          toast({ title: "Success", description: "Project updated successfully." });
          setShowEditProjectDialog(false);
      } catch (error) {
          toast({ title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
      }
  };

  const handleEditTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setProject(p => p ? { ...p, tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } : null);
  };

  const handleTaskDeletion = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
      toast({ title: 'Success', description: 'Task deleted successfully.' });
      setProject(p => p ? {
        ...p,
        tasks: p.tasks.filter(t => t.id !== taskToDelete.id),
        _count: { ...p._count, tasks: p._count.tasks - 1 }
      } : null);
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'An unknown error occurred.', variant: 'destructive' });
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleDeleteTaskInitiated = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleEditContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditContactDialogOpen(true);
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setProject(p => p ? { ...p, contacts: p.contacts.map(c => c.id === updatedContact.id ? updatedContact : c) } : null);
  };

  const handleDocumentUploaded = () => {
    toast({ title: "Success", description: "File uploaded successfully." });
    fetchDocuments();
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }
      toast({ title: "Success", description: "Document deleted successfully." });
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const sortedTasks = useMemo(() => {
    if (!project?.tasks) return [];
    const sorted = [...project.tasks];
    if (!sortKey) return sorted;

    const priorityOrder: Record<Task['priority'], number> = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'URGENT': 3 };
    const statusOrder: Record<Task['status'], number> = { 'TODO': 0, 'IN_PROGRESS': 1, 'IN_REVIEW': 2, 'COMPLETED': 3, 'CANCELLED': 4 };

    sorted.sort((a, b) => {
      if (sortKey === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortKey === 'status') return statusOrder[a.status] - statusOrder[b.status];
      if (sortKey === 'dueDate') {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    if (sortDirection === 'desc') sorted.reverse();
    return sorted;
  }, [project?.tasks, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDirection('asc'); }
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => handleSort(key)} className="px-2 py-1 h-auto">
        {children}
        <span className="ml-2">{sortKey === key ? (sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />) : <ChevronsUpDown size={16} className="text-muted-foreground" />}</span>
      </Button>
    </TableHead>
  );

  const getStatusColor = (status: string) => ({ PLANNING: "bg-gray-100 text-gray-800", IN_PROGRESS: "bg-blue-100 text-blue-800", ON_HOLD: "bg-yellow-100 text-yellow-800", COMPLETED: "bg-green-100 text-green-800", CANCELLED: "bg-red-100 text-red-800" }[status] || "bg-gray-100 text-gray-800");
  const getPriorityColor = (priority: string) => ({ LOW: "bg-slate-100 text-slate-800", MEDIUM: "bg-indigo-100 text-indigo-800", HIGH: "bg-orange-100 text-orange-800", URGENT: "bg-red-100 text-red-800" }[priority] || "bg-slate-100 text-slate-800");
  const getTaskStatusColor = (status: string) => ({ TODO: "bg-gray-100 text-gray-800", IN_PROGRESS: "bg-blue-100 text-blue-800", IN_REVIEW: "bg-yellow-100 text-yellow-800", COMPLETED: "bg-green-100 text-green-800", CANCELLED: "bg-red-100 text-red-800" }[status] || "bg-gray-100 text-gray-800");
  
  if (loading) return <div className="flex items-center justify-center h-64">Loading project...</div>;
  if (error || !project) return <div className="text-red-600 p-4"> {error || "Project not found"} <Link href="/dashboard/projects"><Button>Back</Button></Link></div>;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6">
        
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <h2 className="text-lg font-semibold text-muted-foreground mt-4">Project Description</h2>
            <p className="text-muted-foreground mt-1">{project.description || "No description provided."}</p>

            <h2 className="text-lg font-semibold text-muted-foreground mt-4">Project Goal</h2>
            <p className="text-muted-foreground mt-1">{project.projectGoal || "No goal defined."}</p>

            <div className="flex items-center gap-2 mt-4">
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              {/* MODIFIED: Display projectType badge */}
              <Badge variant="outline">{project.projectType.replace('_', ' ')}</Badge>
            </div>
            
            <div className="flex flex-col gap-2 mt-4 lg:hidden">
              <Link href="/dashboard/projects"><Button variant="outline" className="w-full">Back to Projects</Button></Link>
              <Button onClick={handleEditProjectClick} className="w-full"><Pencil size={16} className="mr-2" />Edit Project</Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full"><Trash2 size={16} className="mr-2" />Delete Project</Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CollapsibleHeader sectionName="projectDetails" title="Project Details" />
            </CardHeader>
            {openSections.projectDetails && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <div><Label>Owner</Label><p className="text-sm text-muted-foreground">{project.owner.name || project.owner.email}</p></div>
                  {project.website && (
                    <div>
                      <Label>Website</Label>
                      <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                        <Link2 size={14} />
                        <span className="truncate">{project.website}</span>
                      </a>
                    </div>
                  )}
                  <div><Label>Contacts</Label><p className="text-sm text-muted-foreground">{project.contacts.length} contact(s)</p></div>
                  <div><Label>Created</Label><p className="text-sm text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p></div>
                </div>
                <div className="space-y-4">
                  <div><Label>Start Date</Label><p className="text-sm text-muted-foreground">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}</p></div>
                  <div><Label>End Date</Label><p className="text-sm text-muted-foreground">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}</p></div>
                  <div><Label>Last Updated</Label><p className="text-sm text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p></div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CollapsibleHeader 
                sectionName="timelineEvents" 
                title="Timeline Events"
                action={
                  <Button onClick={() => timelineSectionRef.current?.handleOpenDialog()}>
                    <PlusCircle size={16} className="mr-2" />
                    Add Event
                  </Button>
                }
              />
            </CardHeader>
            {openSections.timelineEvents && (
              <CardContent>
                <TimelineSection ref={timelineSectionRef} projectId={project.id} onEventsUpdated={fetchProjectData} />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CollapsibleHeader 
                sectionName="contacts" 
                title={`Contacts (${project.contacts.length})`}
                action={<AddContactDialog projectId={project.id} onContactAdded={handleContactAdded} />}
              />
            </CardHeader>
            {openSections.contacts && (
              <CardContent>
                {project.contacts.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{project.contacts.map(contact => (<Card key={contact.id} onClick={() => handleEditContactClick(contact)} className="cursor-pointer hover:bg-muted/50"><CardContent className="pt-6 flex items-center space-x-4"><Avatar><AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`} /><AvatarFallback>{contact.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-semibold">{contact.name}</p><p className="text-sm text-muted-foreground flex items-center"><Mail size={16} className="mr-2" />{contact.email || 'No email'}</p></div></CardContent></Card>))}</div> : <p className="text-center text-muted-foreground py-8">No contacts added yet.</p>}
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CollapsibleHeader 
                sectionName="files" 
                title={`Documents (${documents.length})`}
                action={
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Upload Document
                  </Button>
                }
              />
            </CardHeader>
            {openSections.files && (
              <CardContent>
                <DocumentsTable
                  documents={documents}
                  onDelete={handleDeleteDocument}
                />
              </CardContent>
            )}
          </Card>

        </div>

        <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-6 lg:self-start">
            <div className="hidden lg:flex gap-2 flex-shrink-0">
              <Link href="/dashboard/projects"><Button variant="outline">Back to Projects</Button></Link>
              <Button onClick={handleEditProjectClick}><Pencil size={16} className="mr-2" />Edit</Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 size={16} className="mr-2" />Delete</Button>
            </div>

            {/* NEW: Added Timeline Progress Chart */}
            <TimelineProgressChart events={project.timelineEvents} />

            <Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{project.tasks.length}</div><Button className="mt-4 w-full" size="sm" onClick={() => setShowCreateTaskDialog(true)}>New Task</Button></CardContent></Card>
            <Card>
                <CardHeader>
                <CollapsibleHeader sectionName="tasks" title="Task List" />
                </CardHeader>
                {openSections.tasks && (
                <CardContent>
                    {project.tasks.length > 0 ? (
                    <div>
                        <div className="md:hidden space-y-4">
                        {sortedTasks.map(task => (
                            <Card key={task.id} className="relative" onClick={() => handleEditTaskClick(task)}>
                            <CardContent className="p-4 space-y-2">
                                <div className="font-bold">{task.title}</div>
                                <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge className={getTaskStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Priority</span>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Due Date</span>
                                <span className="text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                                </div>
                            </CardContent>
                            </Card>
                        ))}
                        </div>
                        <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <SortableHeader sortKey="status">Status</SortableHeader>
                                <SortableHeader sortKey="priority">Priority</SortableHeader>
                                <SortableHeader sortKey="dueDate">Due Date</SortableHeader>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {sortedTasks.map(task => (
                                <TableRow key={task.id} onClick={() => handleEditTaskClick(task)} className="cursor-pointer">
                                <TableCell>{task.title}</TableCell>
                                <TableCell><Badge className={getTaskStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge></TableCell>
                                <TableCell><Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge></TableCell>
                                <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </div>
                    </div>
                    ) : <p className="text-center text-muted-foreground py-8">No tasks created yet.</p>}
                </CardContent>
                )}
            </Card>
        </div>
      </div>

      {/* --- DIALOGS & MODALS --- */}
      <UploadDocumentDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={handleDocumentUploaded}
        projectId={projectId}
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the task "{taskToDelete?.title}". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTaskDeletion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditTaskDialog 
        task={selectedTask} 
        isOpen={isEditTaskDialogOpen} 
        onOpenChange={setIsEditTaskDialogOpen} 
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleDeleteTaskInitiated}
      />
      <EditContactDialog contact={selectedContact} isOpen={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen} onContactUpdated={handleContactUpdated} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>This will permanently delete the project and all its data. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProject}>Delete Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select value={newTask.priority} onValueChange={value => setNewTask(p => ({...p, priority: value as Task['priority']}))}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div >
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={projectToEdit?.name || ''} onChange={(e) => setProjectToEdit(p => ({...p, name: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={projectToEdit?.description || ''} onChange={(e) => setProjectToEdit(p => ({...p, description: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="projectGoal" className="text-right pt-2">Goal</Label>
              <Textarea id="projectGoal" value={projectToEdit?.projectGoal || ''} onChange={(e) => setProjectToEdit(p => ({...p, projectGoal: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">Website</Label>
              <Input id="website" value={projectToEdit?.website || ''} onChange={(e) => setProjectToEdit(p => ({...p, website: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={projectToEdit?.status} onValueChange={(value) => setProjectToEdit(p => ({...p, status: value}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={projectToEdit?.priority} onValueChange={(value) => setProjectToEdit(p => ({...p, priority: value}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* NEW: Added Project Type to Edit Dialog */}
            <div className="grid gap-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={projectToEdit?.projectType} onValueChange={(value) => setProjectToEdit(p => ({...p, projectType: value}))}>
                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="POTENTIAL_CLIENT">Potential Client</SelectItem>
                        <SelectItem value="QUALIFIED_CLIENT">Qualified Client</SelectItem>
                        <SelectItem value="CURRENT_CLIENT">Current Client</SelectItem>
                        <SelectItem value="PAST_CLIENT">Past Client</SelectItem>
                        <SelectItem value="PERSONAL_PROJECT">Personal Project</SelectItem>
                        <SelectItem value="PROFESSIONAL_PROJECT">Professional Project</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" value={projectToEdit?.startDate || ''} onChange={(e) => setProjectToEdit(p => ({...p, startDate: e.target.value}))} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={projectToEdit?.endDate || ''} onChange={(e) => setProjectToEdit(p => ({...p, endDate: e.target.value}))} />
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
