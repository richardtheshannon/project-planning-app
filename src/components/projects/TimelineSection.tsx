// src/components/projects/TimelineSection.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Pencil, PlusCircle, Trash2, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  isCompleted: boolean;
  projectId: string;
}

interface TimelineSectionProps {
  projectId: string;
  isOwner: boolean;
}

type SortKey = 'eventDate' | 'isCompleted';
type SortDirection = 'asc' | 'desc';

export function TimelineSection({ projectId, isOwner }: TimelineSectionProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Partial<TimelineEvent> | null>(null);
  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('eventDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/timeline-events?projectId=${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch timeline events.");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [projectId]);

  const handleOpenDialog = (event: Partial<TimelineEvent> | null = null) => {
    setEventToEdit(event ? { ...event, eventDate: new Date(event.eventDate!).toISOString().split('T')[0] } : { title: "", description: "", eventDate: "" });
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventToEdit || !eventToEdit.title || !eventToEdit.eventDate) {
        toast({ title: "Error", description: "Title and Date are required.", variant: "destructive" });
        return;
    }

    const url = eventToEdit.id
      ? `/api/timeline-events/${eventToEdit.id}`
      : `/api/timeline-events`;
    
    const method = eventToEdit.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventToEdit, projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${method === 'POST' ? 'create' : 'update'} event.`);
      }

      const savedEvent = await response.json();
      
      if (method === 'POST') {
        setEvents(prev => [...prev, savedEvent]);
      } else {
        setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
      }

      toast({ title: "Success", description: `Event ${method === 'POST' ? 'created' : 'updated'} successfully.` });
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive" });
    }
  };

  const toggleComplete = async (event: TimelineEvent) => {
    try {
        const response = await fetch(`/api/timeline-events/${event.id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted: !event.isCompleted }),
        });
        if (!response.ok) throw new Error("Failed to update status.");
        const updatedEvent = await response.json();
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        toast({ title: "Success", description: "Event status updated." });
    } catch (err) {
        toast({ title: "Error", description: err instanceof Error ? err.message : "An unknown error occurred.", variant: "destructive" });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
        await fetch(`/api/timeline-events/${eventToDelete.id}`, { method: 'DELETE' });
        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
        toast({ title: "Success", description: "Event deleted." });
    } catch (err) {
        toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    } finally {
        setEventToDelete(null);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
        if (sortKey === 'eventDate') {
            const val = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
            return sortDirection === 'asc' ? val : -val;
        }
        if (sortKey === 'isCompleted') {
            const val = (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0);
            return sortDirection === 'asc' ? val : -val;
        }
        return 0;
    });
  }, [events, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => handleSort(key)} className="px-2 py-1 h-auto">
        {children}
        <span className="ml-2">{sortKey === key ? (sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />) : <ChevronsUpDown size={16} className="text-muted-foreground" />}</span>
      </Button>
    </TableHead>
  );

  if (loading) return <div>Loading timeline...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Timeline</h3>
        {isOwner && (
            <Button onClick={() => handleOpenDialog()}>
                <PlusCircle size={16} className="mr-2" />
                Add Event
            </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <SortableHeader sortKey="eventDate">Date</SortableHeader>
              <TableHead>Event</TableHead>
              <SortableHeader sortKey="isCompleted">Completed</SortableHeader>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length > 0 ? (
              sortedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Checkbox
                      checked={event.isCompleted}
                      onCheckedChange={() => isOwner && toggleComplete(event)}
                      disabled={!isOwner}
                    />
                  </TableCell>
                  <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {event.isCompleted ? <Badge variant="secondary">Completed</Badge> : <Badge variant="outline">Pending</Badge>}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(event)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEventToDelete(event)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isOwner ? 5 : 4} className="h-24 text-center">
                  No timeline events yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{eventToEdit?.id ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {eventToEdit?.id ? "Update the details for this timeline event." : "Fill in the details for the new timeline event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={eventToEdit?.title || ""} onChange={(e) => setEventToEdit(p => ({...p, title: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={eventToEdit?.description || ""} onChange={(e) => setEventToEdit(p => ({...p, description: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventDate" className="text-right">Date</Label>
              <Input id="eventDate" type="date" value={eventToEdit?.eventDate || ""} onChange={(e) => setEventToEdit(p => ({...p, eventDate: e.target.value}))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the event "{eventToDelete?.title}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}