// src/components/projects/AddContactDialog.tsx
'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

interface AddContactDialogProps {
  projectId: string;
  onContactAdded: (newContact: any) => void;
}

// Initial state for the new contact form
const initialContactState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  role: '',
  notes: '',
};

export function AddContactDialog({ projectId, onContactAdded }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [newContact, setNewContact] = useState(initialContactState);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewContact((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!newContact.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Contact name is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send the request to our new API endpoint
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          projectId, // Include the projectId in the request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contact');
      }

      const createdContact = await response.json();

      toast({
        title: 'Success!',
        description: `Contact "${createdContact.name}" has been created and added to the project.`,
      });

      onContactAdded(createdContact); // Update the UI on the project page
      setNewContact(initialContactState); // Reset the form
      setOpen(false); // Close the dialog

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
        <Button>Add New Contact</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create and Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details for the new contact. They will be saved and automatically added to this project.
          </DialogDescription>
        </DialogHeader>
        
        {/* New Contact Form */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input id="name" value={newContact.name} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Jane Doe" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={newContact.email} onChange={handleInputChange} className="col-span-3" placeholder="e.g., jane.doe@example.com" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={newContact.phone} onChange={handleInputChange} className="col-span-3" placeholder="e.g., (555) 123-4567" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input id="company" value={newContact.company} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Acme Inc." />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Title / Role
            </Label>
            <Input id="role" value={newContact.role} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Project Stakeholder" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea id="notes" value={newContact.notes} onChange={handleInputChange} className="col-span-3" placeholder="Any relevant notes about this contact..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Create and Add Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
