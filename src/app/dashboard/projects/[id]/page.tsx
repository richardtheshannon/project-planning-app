// src/app/dashboard/projects/[id]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

// Component Imports
import { AddContactDialog } from "@/components/projects/AddContactDialog";
import { EditTaskDialog } from "@/components/projects/EditTaskDialog";
import { EditContactDialog } from "@/components/projects/EditContactDialog";
import { UploadFileDialog } from "@/components/projects/UploadFileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar, Trash2, ChevronsUpDown, ArrowUp, ArrowDown, File as FileIcon, Download, Trash } from "lucide-react";

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

interface ProjectFile {
  id: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  createdAt: string;
  uploaderId: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
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
  files: ProjectFile[]; 
  _count: {
    tasks: number;
    members: number;
    files: number;
  };
}

type SortKey = 'status' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectAndFiles();
    }
  }, [projectId]);

  const fetchProjectAndFiles = async () => {
    setLoading(true);
    try {
      const [projectResponse, filesResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/files?projectId=${projectId}`)
      ]);

      if (!projectResponse.ok) throw new Error("Project not found or you do not have permission.");
      if (!filesResponse.ok) throw new Error("Failed to fetch project files.");

      const projectData: Project = await projectResponse.json();
      const filesData: ProjectFile[] = await filesResponse.json();
      
      projectData.files = filesData;
      setProject(projectData);

      if (session?.user?.id === projectData.owner.id) {
        setIsOwner(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
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

  const handleEditTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setProject(p => p ? { ...p, tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } : null);
  };

  const handleEditContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditContactDialogOpen(true);
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setProject(p => p ? { ...p, contacts: p.contacts.map(c => c.id === updatedContact.id ? updatedContact : c) } : null);
  };
  
  const handleFileUploaded = (newFile: ProjectFile) => {
    setProject(p => p ? { ...p, files: [newFile, ...p.files], _count: {...p._count, files: p._count.files + 1} } : null);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      const response = await fetch(`/api/files?fileId=${fileToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      toast({ title: "Success", description: `File "${fileToDelete.originalName}" deleted.` });
      setProject(p => p ? { ...p, files: p.files.filter(f => f.id !== fileToDelete.id), _count: {...p._count, files: p._count.files - 1} } : null);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
    } finally {
      setFileToDelete(null);
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
  const formatFileSize = (bytes: number) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const i = Math.floor(Math.log(bytes) / Math.log(k)); return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`; }

  if (loading) return <div className="flex items-center justify-center h-64">Loading project...</div>;
  if (error || !project) return <div className="text-red-600"> {error || "Project not found"} <Link href="/dashboard/projects"><Button>Back</Button></Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
          <div className="flex items-center gap-2 mt-4">
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects"><Button variant="outline">Back to Projects</Button></Link>
          {isOwner && <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 size={16} className="mr-2" />Delete Project</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User size={20} />Project Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Owner</Label><p className="text-sm text-muted-foreground">{project.owner.name || project.owner.email}</p></div>
            <div><Label>Contacts</Label><p className="text-sm text-muted-foreground">{project.contacts.length} contact(s)</p></div>
            <div><Label>Created</Label><p className="text-sm text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={20} />Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Start Date</Label><p className="text-sm text-muted-foreground">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}</p></div>
            <div><Label>End Date</Label><p className="text-sm text-muted-foreground">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}</p></div>
            <div><Label>Last Updated</Label><p className="text-sm text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p></div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{project.tasks.length}</div><Button className="mt-4 w-full" size="sm" onClick={() => setShowCreateTaskDialog(true)}>New Task</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Project Contacts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{project.contacts.length}</div><div className="mt-4"><AddContactDialog projectId={project.id} onContactAdded={handleContactAdded} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Files</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{project.files.length}</div><div className="mt-4"><UploadFileDialog projectId={project.id} onFileUploaded={handleFileUploaded} /></div></CardContent></Card>
      </div>
      
      <div className="my-8">
        <h3 className="text-xl font-semibold mb-4">Tasks</h3>
        {project.tasks.length > 0 ? <Card><Table><TableHeader><TableRow><TableHead>Title</TableHead><SortableHeader sortKey="status">Status</SortableHeader><SortableHeader sortKey="priority">Priority</SortableHeader><SortableHeader sortKey="dueDate">Due Date</SortableHeader></TableRow></TableHeader><TableBody>{sortedTasks.map(task => (<TableRow key={task.id} onClick={() => handleEditTaskClick(task)} className="cursor-pointer"><TableCell>{task.title}</TableCell><TableCell><Badge className={getTaskStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge></TableCell><TableCell><Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge></TableCell><TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</TableCell></TableRow>))}</TableBody></Table></Card> : <p className="text-center text-muted-foreground">No tasks created yet.</p>}
      </div>

      <div className="my-8">
        <h3 className="text-xl font-semibold mb-4">Contacts</h3>
        {project.contacts.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{project.contacts.map(contact => (<Card key={contact.id} onClick={() => handleEditContactClick(contact)} className="cursor-pointer"><CardContent className="pt-6 flex items-center space-x-4"><Avatar><AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`} /><AvatarFallback>{contact.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-semibold">{contact.name}</p><p className="text-sm text-muted-foreground flex items-center"><Mail size={16} className="mr-2" />{contact.email || 'No email'}</p></div></CardContent></Card>))}</div> : <p className="text-center text-muted-foreground">No contacts added yet.</p>}
      </div>

      <div className="my-8">
        <h3 className="text-xl font-semibold mb-4">Files</h3>
        {project.files.length > 0 ? <Card><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Size</TableHead><TableHead>Date Added</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{project.files.map(file => (<TableRow key={file.id}><TableCell><a href={file.path} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-2"><FileIcon size={16} />{file.originalName}</a></TableCell><TableCell>{formatFileSize(file.size)}</TableCell><TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => setFileToDelete(file)}><Trash size={16} className="text-red-500" /></Button><a href={file.path} download><Button variant="ghost" size="icon"><Download size={16} /></Button></a></TableCell></TableRow>))}</TableBody></Table></Card> : <p className="text-center text-muted-foreground">No files uploaded yet.</p>}
      </div>

      <EditTaskDialog task={selectedTask} isOpen={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen} onTaskUpdated={handleTaskUpdated} />
      <EditContactDialog contact={selectedContact} isOpen={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen} onContactUpdated={handleContactUpdated} />
      
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete "{fileToDelete?.originalName}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}><DialogContent><DialogHeader><DialogTitle>Delete Project</DialogTitle><DialogDescription>This will permanently delete the project and all its data. This action cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteProject}>Delete Project</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}><DialogContent><DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Textarea id="description" value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} className="col-span-3" /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="priority" className="text-right">Priority</Label><Select value={newTask.priority} onValueChange={value => setNewTask(p => ({...p, priority: value as Task['priority']}))}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem><SelectItem value="URGENT">Urgent</SelectItem></SelectContent></Select></div ></div><DialogFooter><Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>Cancel</Button><Button onClick={handleCreateTask}>Create Task</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
