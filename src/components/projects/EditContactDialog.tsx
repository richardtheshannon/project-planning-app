// src/components/projects/EditContactDialog.tsx
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

// Define the shape of a Contact object for this component
interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  notes: string | null;
}

interface EditContactDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContactUpdated: (updatedContact: Contact) => void;
}

export function EditContactDialog({ contact, isOpen, onOpenChange, onContactUpdated }: EditContactDialogProps) {
  const [editedContact, setEditedContact] = useState(contact);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // When the selected contact changes (e.g., user clicks a different one),
  // update the form's state to reflect the new contact's data.
  useEffect(() => {
    setEditedContact(contact);
  }, [contact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedContact((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSubmit = async () => {
    if (!editedContact || !editedContact.name.trim()) {
       toast({
        title: 'Validation Error',
        description: 'Contact name is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send the updated data to the API endpoint we created
      const response = await fetch(`/api/contacts/${editedContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedContact),
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      const updatedContact = await response.json();

      toast({
        title: 'Success!',
        description: 'Contact has been updated.',
      });

      onContactUpdated(updatedContact); // Send the updated data back to the project page
      onOpenChange(false); // Close the dialog

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if there's no contact selected
  if (!editedContact) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Make changes to the contact's details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {/* Edit Contact Form */}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input id="name" value={editedContact.name} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" value={editedContact.email || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={editedContact.phone || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Company
            </Label>
            <Input id="company" value={editedContact.company || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Title / Role
            </Label>
            <Input id="role" value={editedContact.role || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea id="notes" value={editedContact.notes || ''} onChange={handleInputChange} className="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
