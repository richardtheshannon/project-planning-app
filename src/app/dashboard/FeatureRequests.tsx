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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from 'sonner';
import { ArrowUpDown } from 'lucide-react';

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
                body: JSON.stringify({ title, description, priority, dueDate: dueDate || null }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feature request');
            }

            setTitle('');
            setDescription('');
            setPriority("Medium");
            setDueDate('');
            fetchRequests();
            toast.success('Feature request submitted successfully!');

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
                                    <SortableHeader tkey="dueDate" label="Due Date" className="w-[20%]" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedRequests.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        onClick={() => handleRowClick(request.id)}
                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <TableCell className="break-words">{request.title}</TableCell>
                                        <TableCell>{request.status}</TableCell>
                                        <TableCell>{request.priority}</TableCell>
                                        <TableCell className="hidden md:table-cell">{request.submittedBy}</TableCell>
                                        <TableCell>{request.dueDate ? new Date(request.dueDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}