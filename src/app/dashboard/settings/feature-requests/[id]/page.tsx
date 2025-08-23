"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

export default function FeatureRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id as string;

    const [request, setRequest] = useState<FeatureRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [editStatus, setEditStatus] = useState<"Pending" | "In Progress" | "Done" | "Canceled">("Pending");
    const [editDueDate, setEditDueDate] = useState('');

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const fetchRequest = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/feature-requests/${requestId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Feature request not found');
                }
                throw new Error('Failed to fetch feature request');
            }
            const data = await response.json();
            setRequest(data);
            // Initialize edit fields
            setEditTitle(data.title);
            setEditDescription(data.description);
            setEditPriority(data.priority);
            setEditStatus(data.status);
            setEditDueDate(data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '');
        } catch (error) {
            console.error('Error fetching request:', error);
            setError(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!request) return;

        try {
            const response = await fetch(`/api/feature-requests/${request.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority: editPriority,
                    status: editStatus,
                    dueDate: editDueDate || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update feature request');
            }

            setIsEditing(false);
            fetchRequest();
            toast.success('Feature request updated successfully!');
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Failed to update feature request.');
        }
    };

    const handleDelete = async () => {
        if (!request) return;

        try {
            const response = await fetch(`/api/feature-requests/${request.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete feature request');
            }

            toast.success('Feature request deleted successfully!');
            router.push('/dashboard/settings/feature-requests');
        } catch (error) {
            console.error('Error deleting request:', error);
            toast.error('Failed to delete feature request.');
        }
    };

    const handleEditClick = () => {
        if (!request) return;
        setEditTitle(request.title);
        setEditDescription(request.description);
        setEditPriority(request.priority);
        setEditStatus(request.status);
        setEditDueDate(request.dueDate ? new Date(request.dueDate).toISOString().split('T')[0] : '');
        setIsEditing(true);
    };

    useEffect(() => {
        fetchRequest();
    }, [requestId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Done': return 'bg-green-100 text-green-800';
            case 'Canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Low': return 'bg-slate-100 text-slate-800';
            case 'Medium': return 'bg-indigo-100 text-indigo-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                        <p className="mt-4 text-muted-foreground">Loading feature request...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !request) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600 mb-4">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-semibold">{error || "Feature request not found"}</p>
                        </div>
                        <Link href="/dashboard/settings/feature-requests">
                            <Button variant="outline" className="min-h-[44px]">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Feature Requests
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col gap-4">
                    {/* Back button for mobile */}
                    <div className="sm:hidden">
                        <Link href="/dashboard/settings/feature-requests">
                            <Button variant="ghost" size="sm" className="min-h-[44px] -ml-2">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold break-words">{request.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={`${getStatusColor(request.status)} text-xs sm:text-sm`}>
                                    {request.status}
                                </Badge>
                                <Badge className={`${getPriorityColor(request.priority)} text-xs sm:text-sm`}>
                                    {request.priority}
                                </Badge>
                            </div>
                        </div>
                        
                        {/* Desktop actions */}
                        <div className="hidden sm:flex gap-2 flex-shrink-0">
                            <Link href="/dashboard/settings/feature-requests">
                                <Button variant="outline" className="min-h-[44px]">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <Button onClick={handleEditClick} className="min-h-[44px]">
                                <Pencil size={16} className="mr-2" />
                                Edit
                            </Button>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="min-h-[44px]">
                                <Trash2 size={16} className="mr-2" />
                                Delete
                            </Button>
                        </div>

                        {/* Mobile actions */}
                        <div className="flex sm:hidden gap-2 w-full">
                            <Button onClick={handleEditClick} className="flex-1 min-h-[44px]">
                                <Pencil size={16} className="mr-2" />
                                Edit
                            </Button>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="flex-1 min-h-[44px]">
                                <Trash2 size={16} className="mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {request.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Metadata */}
                <div className="order-1 lg:order-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-muted-foreground">Submitted by</p>
                                    <p className="font-medium text-sm sm:text-base break-words">{request.submittedBy}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <Clock size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="font-medium text-sm sm:text-base">
                                        {new Date(request.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                    </p>
                                </div>
                            </div>

                            {request.dueDate && (
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-muted-foreground">Due Date</p>
                                        <p className="font-medium text-sm sm:text-base">
                                            {new Date(request.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                                <p className="font-medium text-sm sm:text-base">
                                    {new Date(request.updatedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog - Now responsive with full-screen on mobile */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Feature Request</DialogTitle>
                        <DialogDescription>
                            Update the details of this feature request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-h-[150px] sm:min-h-[200px] w-full resize-y"
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
                        <div className="space-y-2">
                            <Label htmlFor="edit-due-date">Due Date</Label>
                            <Input
                                id="edit-due-date"
                                type="date"
                                value={editDueDate}
                                onChange={(e) => setEditDueDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto min-h-[44px]">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="w-full sm:w-auto min-h-[44px]">
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Feature Request</DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete "{request.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto min-h-[44px]">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto min-h-[44px]">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}