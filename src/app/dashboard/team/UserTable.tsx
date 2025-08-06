// src/app/dashboard/team/UserTable.tsx

"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';
import { UserActions } from './UserActions';
import AddUserForm from './AddUserForm'; // Import the new form component
import { Toaster } from 'react-hot-toast'; // Import the Toaster for notifications

// Define the User type to match the data passed from the server component
type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    avatar?: string | null;
};

export default function UserTable({ users: initialUsers }: { users: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const { data: session } = useSession();

    // This function is called when an admin toggles the switch
    const handleToggleActive = async (userId: string, newStatus: boolean) => {
        // Optimistic update
        const originalUsers = [...users];
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
                setUsers(originalUsers);
                console.error('Failed to update user status:', errorData.message);
            }
        } catch (error) {
            // Revert on error as well
            setUsers(originalUsers);
            console.error("An unexpected error occurred:", error);
        }
    };

    // This function will be called from both UserActions and AddUserForm.
    // It forces a page reload to fetch the latest user data.
    const handleDataUpdate = () => {
        window.location.reload();
    };

    const handleUserDelete = (deletedUserId: string) => {
        // Filter out the deleted user from the state to provide immediate UI feedback.
        setUsers(currentUsers => currentUsers.filter(user => user.id !== deletedUserId));
    };

    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <>
            {/* The Toaster component is required for react-hot-toast to display notifications */}
            <div><Toaster position="top-center" reverseOrder={false} /></div>

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
                                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.name}
                                    </TableCell>
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
                                            <Switch
                                                checked={user.isActive}
                                                onCheckedChange={(newStatus) => handleToggleActive(user.id, newStatus)}
                                                disabled={user.id === session?.user?.id}
                                            />
                                        </TableCell>
                                    )}
                                    {isAdmin && (
                                        <TableCell className="text-right">
                                            <UserActions
                                                user={user}
                                                onUserUpdated={handleDataUpdate}
                                                onUserDeleted={() => handleUserDelete(user.id)}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Render the AddUserForm below the table if the user is an admin */}
            {isAdmin && (
                <AddUserForm onUserAdded={handleDataUpdate} />
            )}
        </>
    );
}
