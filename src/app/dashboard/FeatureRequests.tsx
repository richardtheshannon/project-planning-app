'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Toaster, toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from 'lucide-react';

// UPDATE: Added optional dueDate to the interface
interface FeatureRequest {
    id: number;
    title: string;
    description: string;
    status: "Pending" | "In Progress" | "Done" | "Canceled";
    priority: "Low" | "Medium" | "High";
    submittedBy: string;
    createdAt: string;
    updatedAt: string;
    dueDate?: string | null;
}

type SortKey = keyof FeatureRequest;

export default function FeatureRequests() {
    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    // UPDATE: Added state for the new due date field
    const [dueDate, setDueDate] = useState('');

    const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [editStatus, setEditStatus] = useState<"Pending" | "In Progress" | "Done" | "Canceled">("Pending");
    // UPDATE: Added state for editing the due date
    const [editDueDate, setEditDueDate] = useState('');

    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/feature-requests');
            if (!response.ok) {
                throw new Error('Failed to fetch feature requests');
            }
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load feature requests.');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/feature-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // UPDATE: Sent dueDate to the API. It will be null if the date is not set.
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feature request');
            }

            setTitle('');
            setDescription('');
            setPriority("Medium");
            // UPDATE: Reset the due date field after submission
            setDueDate('');
            fetchRequests();
            toast.success('Feature request submitted successfully!');

        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit feature request.');
        }
    };
    
    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        try {
            const response = await fetch(`/api/feature-requests/${selectedRequest.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority: editPriority,
                    status: editStatus,
                    // UPDATE: Sent the updated dueDate to the API
                    dueDate: editDueDate || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update feature request');
            }

            setIsEditing(false);
            setSelectedRequest(null);
            fetchRequests();
            toast.success('Feature request updated successfully!');
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Failed to update feature request.');
        }
    };

    const handleDelete = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`/api/feature-requests/${selectedRequest.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete feature request');
            }

            setSelectedRequest(null);
            fetchRequests();
            toast.success('Feature request deleted successfully!');
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Failed to delete feature request.');
        }
    };

    const handleViewDetails = (request: FeatureRequest) => {
        setSelectedRequest(request);
        setEditTitle(request.title);
        setEditDescription(request.description);
        setEditPriority(request.priority);
        setEditStatus(request.status);
        // UPDATE: Set the edit due date state, formatting it for the date input
        setEditDueDate(request.dueDate ? new Date(request.dueDate).toISOString().split('T')[0] : '');
    };

    const handleCloseDetails = () => {
        setSelectedRequest(null);
        setIsEditing(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const sortedRequests = useMemo(() => {
        const sorted = [...requests].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            // Handle null or undefined values for sorting
            if (valA == null) return 1;
            if (valB == null) return -1;

            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });

        if (sortOrder === 'desc') {
            return sorted.reverse();
        }

        return sorted;
    }, [requests, sortKey, sortOrder]);

    const SortableHeader = ({ tkey, label, className }: { tkey: SortKey, label: string, className?: string }) => {
        const handleSort = (key: SortKey) => {
            if (sortKey === key) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
                setSortKey(key);
                setSortOrder('asc');
            }
        };

        return (
            <TableHead onClick={() => handleSort(tkey)} className={`cursor-pointer hover:bg-muted/50 ${className}`}>
                <div className="flex items-center gap-2">
                    {label}
                    {sortKey === tkey && <ArrowUpDown className="h-4 w-4" />}
                </div>
            </TableHead>
        );
    };


    return (
        <div className="flex flex-col space-y-4">
            <Toaster position="bottom-right" />
            <Card>
                <CardHeader>
                    <CardTitle>Development Feature Request</CardTitle>
                    <CardDescription>
                        Submit a new feature idea or request for the development team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            placeholder="Title (e.g., Add dark mode)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <Textarea
                            placeholder="Describe the feature in detail."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)} value={priority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* UPDATE: Added Due Date input to the submission form */}
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Submitted Requests</CardTitle>
                    <CardDescription>
                        Here are the features that have been requested so far. Click a row for details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow>
                                    <SortableHeader tkey="title" label="Title" className="w-[35%]" />
                                    <SortableHeader tkey="status" label="Status" className="w-[15%]" />
                                    <SortableHeader tkey="priority" label="Priority" className="w-[15%]" />
                                    <SortableHeader tkey="submittedBy" label="Submitted By" className="hidden md:table-cell w-[15%]" />
                                    {/* UPDATE: Replaced 'Date' (createdAt) with 'Due Date' */}
                                    <SortableHeader tkey="dueDate" label="Due Date" className="w-[20%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedRequests.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        onClick={() => handleViewDetails(request)}
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <TableCell className="break-words">{request.title}</TableCell>
                                        <TableCell>{request.status}</TableCell>
                                        <TableCell>{request.priority}</TableCell>
                                        <TableCell className="hidden md:table-cell">{request.submittedBy}</TableCell>
                                        {/* UPDATE: Display the formatted due date, or 'N/A' if not set */}
                                        <TableCell>{request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={handleCloseDetails}>
                {selectedRequest && !isEditing && (
                    <DialogContent className="w-[90vw] max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedRequest.title}</DialogTitle>
                            <DialogDescription>
                                Details of the submitted feature request.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-semibold">Description:</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{selectedRequest.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Status:</span>
                                    <span className="text-sm">{selectedRequest.status}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Priority:</span>
                                    <span className="text-sm">{selectedRequest.priority}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Submitted By:</span>
                                    <span className="text-sm">{selectedRequest.submittedBy}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Submitted On:</span>
                                    <span className="text-sm">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                                </div>
                                {/* UPDATE: Display Due Date in the details view */}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Due Date:</span>
                                    <span className="text-sm">{selectedRequest.dueDate ? new Date(selectedRequest.dueDate).toLocaleDateString() : 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between mt-4 gap-2">
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                            <div className="flex justify-end space-x-2">
                                <Button variant="secondary" onClick={handleCloseDetails}>
                                    Cancel
                                </Button>
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                )}

                {selectedRequest && isEditing && (
                    <DialogContent className="w-[90vw] max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Request</DialogTitle>
                            <DialogDescription>
                                Update the details of the feature request.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-priority">Priority</Label>
                                    <Select onValueChange={(value: "Low" | "Medium" | "High") => setEditPriority(value)} value={editPriority}>
                                        <SelectTrigger id="edit-priority" className="w-full">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select onValueChange={(value: "Pending" | "In Progress" | "Done" | "Canceled") => setEditStatus(value)} value={editStatus}>
                                        <SelectTrigger id="edit-status" className="w-full">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Done">Done</SelectItem>
                                            <SelectItem value="Canceled">Canceled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {/* UPDATE: Added Due Date input to the edit form */}
                            <div className="space-y-2">
                                <Label htmlFor="edit-due-date">Due Date</Label>
                                <Input
                                    id="edit-due-date"
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
