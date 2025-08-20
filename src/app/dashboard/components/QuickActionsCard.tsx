'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';

export default function QuickActionsCard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the feature request.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare the request body
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'Pending',
        submittedBy: session?.user?.name || session?.user?.email || 'Unknown User',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      console.log('Submitting feature request:', requestBody);

      const response = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to create feature request: ${response.status}`);
      }

      const result = await response.json();
      console.log('Feature request created:', result);

      toast({
        title: "Success",
        description: "Feature request created successfully!",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: ''
      });
      setOpen(false);
      
      // Refresh the page to show new data
      router.refresh();
    } catch (error) {
      console.error('Error creating feature request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create feature request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Link href="/dashboard/projects/new">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Feature Request
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard/projects">View All Projects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Development Feature Request</DialogTitle>
            <DialogDescription>
              Submit a new feature idea or request for the development team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Add dark mode"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the feature in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  disabled={loading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}