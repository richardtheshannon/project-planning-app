'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from 'sonner';
import { ArrowUpDown, Calendar, ChevronRight, Clock, User } from 'lucide-react';

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
    const router = useRouter();
    const [requests, setRequests] = useState<FeatureRequest[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
    const [dueDate, setDueDate] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feature request');
            }

            const newFeatureRequest = await response.json();

            setTitle('');
            setDescription('');
            setPriority("Medium");
            setDueDate('');
            
            toast.success('Feature request submitted successfully!');
            router.push(`/dashboard/settings/feature-requests/${newFeatureRequest.id}`);

        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit feature request.');
        }
    };

    const handleRowClick = (requestId: number) => {
        router.push(`/dashboard/settings/feature-requests/${requestId}`);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const sortedRequests = useMemo(() => {
        const sorted = [...requests].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

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

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const SortableHeader = ({ tkey, label, className }: { tkey: SortKey, label: string, className?: string }) => {
        return (
            <TableHead onClick={() => handleSort(tkey)} className={`cursor-pointer hover:bg-muted/50 ${className}`}>
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="truncate">{label}</span>
                    {sortKey === tkey && <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />}
                </div>
            </TableHead>
        );
    };

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

    return (
        <div className="flex flex-col space-y-4 p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
            <Toaster position="bottom-right" />
            
            {/* Form Card */}
            <Card>
                <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-xl sm:text-2xl">Development Feature Request</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Submit a new feature idea or request for the development team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Add dark mode"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the feature in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="min-h-[100px] sm:min-h-[120px] w-full resize-y"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-sm font-medium">
                                    Priority
                                </Label>
                                <Select onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)} value={priority}>
                                    <SelectTrigger id="priority" className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="dueDate" className="text-sm font-medium">
                                    Due Date (Optional)
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full sm:w-auto min-h-[44px]">
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Requests List Card */}
            <Card>
                <CardHeader className="pb-4 sm:pb-6">
                    <CardTitle className="text-xl sm:text-2xl">Submitted Requests</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        {requests.length > 0 
                            ? `${requests.length} request${requests.length === 1 ? '' : 's'} submitted. Click a row for details.`
                            : 'No requests submitted yet.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    {/* Mobile View - Cards */}
                    {isMobile ? (
                        <div className="space-y-3">
                            {sortedRequests.map((request) => (
                                <Card 
                                    key={request.id}
                                    onClick={() => handleRowClick(request.id)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors p-4"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-base line-clamp-2 flex-1">
                                                {request.title}
                                            </h3>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={`${getStatusColor(request.status)} text-xs`}>
                                                {request.status}
                                            </Badge>
                                            <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                                                {request.priority}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="truncate">{request.submittedBy}</span>
                                            </div>
                                            
                                            {request.dueDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Due: {new Date(request.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>Created: {new Date(request.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {sortedRequests.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No feature requests yet. Submit one above!
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Table */
                        <div className="overflow-x-auto -mx-2 sm:mx-0">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <SortableHeader tkey="title" label="Title" className="min-w-[200px]" />
                                        <SortableHeader tkey="status" label="Status" className="min-w-[100px]" />
                                        <SortableHeader tkey="priority" label="Priority" className="min-w-[100px]" />
                                        <SortableHeader tkey="submittedBy" label="Submitted By" className="hidden lg:table-cell min-w-[150px]" />
                                        <SortableHeader tkey="dueDate" label="Due Date" className="min-w-[120px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedRequests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            onClick={() => handleRowClick(request.id)}
                                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="line-clamp-2">
                                                    {request.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(request.status)} text-xs`}>
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getPriorityColor(request.priority)} text-xs`}>
                                                    {request.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell truncate">
                                                {request.submittedBy}
                                            </TableCell>
                                            <TableCell>
                                                {request.dueDate 
                                                    ? new Date(request.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) 
                                                    : 'Not set'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sortedRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No feature requests yet. Submit one above!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}