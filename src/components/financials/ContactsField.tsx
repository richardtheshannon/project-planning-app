"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactItem {
  id?: string;
  name: string;
  email?: string | null;  // Allow null
  phone?: string | null;  // Allow null
  note?: string | null;   // Allow null
  _action?: 'create' | 'update' | 'delete';
}

interface ContactsFieldProps {
  contacts: ContactItem[];
  onChange: (contacts: ContactItem[]) => void;
  disabled?: boolean;
}

export default function ContactsField({ contacts, onChange, disabled }: ContactsFieldProps) {
  const [localContacts, setLocalContacts] = useState<ContactItem[]>(
    contacts.length > 0 ? contacts : [{ name: '', email: '', phone: '', note: '' }]
  );

  const handleContactChange = (index: number, field: keyof ContactItem, value: string) => {
    const updated = [...localContacts];
    updated[index] = {
      ...updated[index],
      [field]: value || null,  // Convert empty string to null
      _action: updated[index].id ? 'update' : 'create'
    };
    setLocalContacts(updated);
    onChange(updated.filter(c => c._action !== 'delete'));
  };

  const addContact = () => {
    const newContact: ContactItem = { name: '', email: null, phone: null, note: null, _action: 'create' };
    const updated = [...localContacts, newContact];
    setLocalContacts(updated);
    onChange(updated.filter(c => c._action !== 'delete'));
  };

  const removeContact = (index: number) => {
    const updated = [...localContacts];
    if (updated[index].id) {
      // Mark existing contact for deletion
      updated[index] = { ...updated[index], _action: 'delete' };
    } else {
      // Remove new contact that hasn't been saved
      updated.splice(index, 1);
    }
    setLocalContacts(updated);
    onChange(updated.filter(c => c._action !== 'delete' || c.id));
  };

  const visibleContacts = localContacts.filter(c => c._action !== 'delete');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Contacts</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addContact}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Contact
        </Button>
      </div>

      {visibleContacts.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed rounded-lg">
          <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No contacts added yet</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addContact}
            disabled={disabled}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add First Contact
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleContacts.map((contact, index) => (
            <div
              key={index}
              className={cn(
                "p-4 border rounded-lg space-y-3",
                contact._action === 'delete' && "opacity-50"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-muted-foreground">
                  Contact {index + 1}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeContact(index)}
                  disabled={disabled || visibleContacts.length === 1}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`contact-name-${index}`} className="text-xs">
                    Name *
                  </Label>
                  <Input
                    id={`contact-name-${index}`}
                    value={contact.name || ''}
                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                    placeholder="Contact name"
                    disabled={disabled}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`contact-email-${index}`} className="text-xs">
                    Email
                  </Label>
                  <Input
                    id={`contact-email-${index}`}
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`contact-phone-${index}`} className="text-xs">
                    Phone
                  </Label>
                  <Input
                    id={`contact-phone-${index}`}
                    value={contact.phone || ''}
                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`contact-note-${index}`} className="text-xs">
                    Note
                  </Label>
                  <Input
                    id={`contact-note-${index}`}
                    value={contact.note || ''}
                    onChange={(e) => handleContactChange(index, 'note', e.target.value)}
                    placeholder="Additional notes"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}