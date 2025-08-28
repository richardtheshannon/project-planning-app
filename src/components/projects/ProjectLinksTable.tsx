'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface ProjectLink {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

interface ProjectLinksTableProps {
  projectId: string;
}

export function ProjectLinksTable({ projectId }: ProjectLinksTableProps) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: 'https://' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch existing links
  useEffect(() => {
    fetchLinks();
  }, [projectId]);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/links`);
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
      toast({
        title: "Error",
        description: "Could not load project links.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url || newLink.url === 'https://') {
      toast({
        title: "Validation Error",
        description: "Both title and URL are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });

      if (!response.ok) throw new Error('Failed to add link');
      
      const link = await response.json();
      setLinks([link, ...links]);
      setNewLink({ title: '', url: 'https://' });
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Link added successfully.",
      });
    } catch (error) {
      console.error('Failed to add link:', error);
      toast({
        title: "Error",
        description: "Failed to add link.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLink = async (linkId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the link "${title}"?`)) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/links/${linkId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete link');
      
      setLinks(links.filter(link => link.id !== linkId));
      toast({
        title: "Success",
        description: "Link deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast({
        title: "Error",
        description: "Failed to delete link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Links ({links.length})</h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Add Link Form - Mobile Responsive */}
      {isAdding && (
        <div className="mb-4 p-3 border rounded-lg bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Link title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="https://example.com"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddLink} size="sm">
                Save
              </Button>
              <Button 
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({ title: '', url: 'https://' });
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Links Table - Mobile Responsive */}
      {loading ? (
        <div className="text-center py-4">Loading links...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No links added yet
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop View */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Title</th>
                  <th className="text-left pb-2">URL</th>
                  <th className="text-left pb-2">Added</th>
                  <th className="text-right pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b">
                    <td className="py-2">{link.title}</td>
                    <td className="py-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline max-w-xs truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-2">
                      {format(new Date(link.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        onClick={() => handleDeleteLink(link.id, link.title)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-2">
            {links.map((link) => (
              <div key={link.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{link.title}</h4>
                  <Button
                    onClick={() => handleDeleteLink(link.id, link.title)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive -mt-1 -mr-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:underline text-sm break-all"
                >
                  {link.url}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Added: {format(new Date(link.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}