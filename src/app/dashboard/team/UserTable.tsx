"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { Card, CardContent } from '@/components/ui/card';

// Define the User type to match the data passed from the server component
type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
};

export default function UserTable({ users: initialUsers }: { users: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const { data: session } = useSession();

    // This function is called when an admin toggles the switch
    const handleToggleActive = async (userId: string, newStatus: boolean) => {
        // Immediately update the UI for a responsive feel (optimistic update)
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId ? { ...user, isActive: newStatus } : user
            )
        );

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Revert the UI change if the API call fails
                setUsers(initialUsers);
                throw new Error(errorData.message || 'Failed to update user status');
            }

            toast.success(`User has been ${newStatus ? 'enabled' : 'disabled'}.`);
        } catch (error) {
            // Revert on error as well
            setUsers(initialUsers);
            toast.error((error as Error).message || "An unexpected error occurred.");
        }
    };

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <>
            <Toaster position="bottom-right" />
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                {isAdmin && <TableHead className="text-right">Enable/Disable</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            {/* Prevent an admin from disabling their own account */}
                                            <Switch
                                                checked={user.isActive}
                                                onCheckedChange={(newStatus) => handleToggleActive(user.id, newStatus)}
                                                disabled={user.id === session?.user?.id}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
