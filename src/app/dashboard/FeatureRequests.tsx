'use client';

import { useState, useEffect, FormEvent } from 'react';
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

// Define the interface for our data models
interface FeatureRequest {
    id: number;
    title: string;
    description: string;
    status: "Pending" | "In Progress" | "Done" | "Canceled";
    priority: "Low" | "Medium" | "High";
    submittedBy: string;
    createdAt: string;
    updatedAt: string;
}

export default function FeatureRequests() {
    // State to manage the list of feature requests
    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    // State to manage the form inputs for new requests
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    // State to manage the currently selected request for the detail view
    const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
    // State to manage the edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State to manage edit form inputs
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [editStatus, setEditStatus] = useState<"Pending" | "In Progress" | "Done" | "Canceled">("Pending");

    // Function to fetch all feature requests from the API
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

    // Function to handle form submission for a new request
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/feature-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, priority }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feature request');
            }

            // Clear the form and refresh the data
            setTitle('');
            setDescription('');
            setPriority("Medium");
            fetchRequests();
            toast.success('Feature request submitted successfully!');

        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit feature request.');
        }
    };
    
    // Function to handle updating a request
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
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update feature request');
            }

            // Close edit mode and refresh the data
            setIsEditing(false);
            setSelectedRequest(null);
            fetchRequests();
            toast.success('Feature request updated successfully!');
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Failed to update feature request.');
        }
    };

    // Function to handle deleting a request
    const handleDelete = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`/api/feature-requests/${selectedRequest.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete feature request');
            }

            // Close the dialog and refresh the data
            setSelectedRequest(null);
            fetchRequests();
            toast.success('Feature request deleted successfully!');
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Failed to delete feature request.');
        }
    };

    // Handler to open the detail view dialog
    const handleViewDetails = (request: FeatureRequest) => {
        setSelectedRequest(request);
        // Initialize edit form states with selected request data
        setEditTitle(request.title);
        setEditDescription(request.description);
        setEditPriority(request.priority);
        setEditStatus(request.status);
    };

    // Handler to close the detail view dialog
    const handleCloseDetails = () => {
        setSelectedRequest(null);
        setIsEditing(false);
    };

    // Initial data fetch on component mount
    useEffect(() => {
        fetchRequests();
    }, []);

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
                        <Select onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)} value={priority}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Submitted By</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow
                                    key={request.id}
                                    onClick={() => handleViewDetails(request)}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <TableCell>{request.title}</TableCell>
                                    <TableCell>{request.status}</TableCell>
                                    <TableCell>{request.priority}</TableCell>
                                    <TableCell>{request.submittedBy}</TableCell>
                                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Feature Request Detail Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={handleCloseDetails}>
                {selectedRequest && !isEditing && (
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedRequest.title}</DialogTitle>
                            <DialogDescription>
                                Details of the submitted feature request.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-semibold">Description:</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedRequest.description}</p>
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
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between mt-4">
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                            <div className="flex space-x-2">
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
                    <DialogContent className="sm:max-w-[425px]">
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
