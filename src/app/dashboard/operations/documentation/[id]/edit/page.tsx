'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  X,
  Plus
} from 'lucide-react';

interface Documentation {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

export default function DocumentationEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [documentation, setDocumentation] = useState<Documentation>({
    id: '',
    title: '',
    content: '',
    category: 'DEVELOPMENT',
    tags: [],
    isPublished: true,
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'DEVELOPMENT', label: 'Development' },
    { value: 'PROJECTS', label: 'Projects' },
    { value: 'CLIENTS', label: 'Clients' },
    { value: 'OPERATIONS', label: 'Operations' },
    { value: 'FINANCIALS', label: 'Financials' },
    { value: 'SETTINGS', label: 'Settings' },
  ];

  useEffect(() => {
    fetchDocumentation();
  }, [params.id]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documentation/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch documentation');

      const data = await response.json();
      setDocumentation({
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        isPublished: data.isPublished,
      });
    } catch (error) {
      console.error('Error fetching documentation:', error);
      toast.error('Failed to load documentation');
      router.push('/dashboard/operations/documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentation.title || !documentation.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/documentation/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: documentation.title,
          content: documentation.content,
          category: documentation.category,
          tags: documentation.tags,
          isPublished: documentation.isPublished,
        }),
      });

      if (!response.ok) throw new Error('Failed to update documentation');

      toast.success('Documentation updated successfully');
      router.push(`/dashboard/operations/documentation/${params.id}`);
    } catch (error) {
      console.error('Error updating documentation:', error);
      toast.error('Failed to update documentation');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !documentation.tags.includes(newTag.trim())) {
      setDocumentation({
        ...documentation,
        tags: [...documentation.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setDocumentation({
      ...documentation,
      tags: documentation.tags.filter(tag => tag !== tagToRemove),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card className="bg-card border rounded-lg shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">Loading documentation...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Documentation</h1>
            <p className="text-muted-foreground mt-1">
              Update documentation content and settings
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/operations/documentation/${params.id}`)}
            className="self-start sm:self-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to View
          </Button>
        </div>

        {/* Edit Form */}
        <Card className="bg-card border rounded-lg shadow-sm">
          <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={documentation.title}
                onChange={(e) => setDocumentation({ ...documentation, title: e.target.value })}
                placeholder="Enter documentation title"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={documentation.category} 
                onValueChange={(value) => setDocumentation({ ...documentation, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <div className="border rounded-md overflow-hidden">
                <Textarea
                  id="content"
                  value={documentation.content}
                  onChange={(e) => setDocumentation({ ...documentation, content: e.target.value })}
                  placeholder="Enter documentation content (Markdown supported)"
                  className="w-full min-h-[400px] p-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary border-0 font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              
              {/* Tag Input */}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  variant="outline"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 min-w-[44px]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Tags Display */}
              {documentation.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {documentation.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {/* Published Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="published"
                  checked={documentation.isPublished}
                  onCheckedChange={(checked) => 
                    setDocumentation({ ...documentation, isPublished: checked as boolean })
                  }
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm">Published (visible to all users)</span>
              </label>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/operations/documentation/${params.id}`)}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}