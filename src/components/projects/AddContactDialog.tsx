// src/components/projects/AddContactDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import type { Contact } from '@prisma/client';

interface AddContactDialogProps {
  projectId: string;
  onContactAdded: (newContact: any) => void; // Callback to update the UI
}

export function AddContactDialog({ projectId, onContactAdded }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all available contacts when the dialog is opened
  useEffect(() => {
    if (open) {
      const fetchContacts = async () => {
        try {
          // Note: You might need to create this API endpoint
          const response = await fetch('/api/contacts');
          if (!response.ok) {
            throw new Error('Failed to fetch contacts');
          }
          const data = await response.json();
          setContacts(data);
        } catch (error) {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Could not load contacts.',
            variant: 'destructive',
          });
        }
      };
      fetchContacts();
    }
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!selectedContactId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a contact to add.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: selectedContactId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add contact');
      }

      const newProjectContact = await response.json();

      toast({
        title: 'Success!',
        description: `"${newProjectContact.contact.name}" has been added to the project.`,
      });

      onContactAdded(newProjectContact.contact); // Use the callback
      setOpen(false); // Close the dialog on success
      setSelectedContactId(null); // Reset selection

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Contact</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Contact to Project</DialogTitle>
          <DialogDescription>
            Select an existing contact to add them to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact
            </Label>
            <Select
              onValueChange={setSelectedContactId}
              value={selectedContactId || ''}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add to Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
