'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  User,
  Tag,
  Link
} from 'lucide-react';
import { format } from 'date-fns';

interface Documentation {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  sourceFeatureRequest: {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
  } | null;
}

export default function DocumentationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [documentation, setDocumentation] = useState<Documentation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentation();
  }, [params.id]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documentation/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch documentation');

      const data = await response.json();
      setDocumentation(data);
    } catch (error) {
      console.error('Error fetching documentation:', error);
      toast.error('Failed to load documentation');
      router.push('/dashboard/operations/documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this documentation?')) return;

    try {
      const response = await fetch(`/api/documentation/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete documentation');

      toast.success('Documentation deleted successfully');
      router.push('/dashboard/operations/documentation');
    } catch (error) {
      console.error('Error deleting documentation:', error);
      toast.error('Failed to delete documentation');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      DEVELOPMENT: 'bg-blue-500',
      PROJECTS: 'bg-green-500',
      CLIENTS: 'bg-purple-500',
      OPERATIONS: 'bg-orange-500',
      FINANCIALS: 'bg-yellow-500',
      SETTINGS: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading documentation...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Documentation not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/operations/documentation')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => router.push(`/dashboard/operations/documentation/${params.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-3xl">{documentation.title}</CardTitle>
            <div className="flex items-center space-x-4 mt-4">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(documentation.category)}`}
              >
                {documentation.category}
              </span>
              {!documentation.isPublished && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span>Author: {documentation.user.name || documentation.user.email}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Created: {format(new Date(documentation.createdAt), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Updated: {format(new Date(documentation.updatedAt), 'MMMM dd, yyyy')}</span>
            </div>
            {documentation.sourceFeatureRequest && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Link className="mr-2 h-4 w-4" />
                <span>Source: Feature Request #{documentation.sourceFeatureRequest.id}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {documentation.tags && documentation.tags.length > 0 && (
            <div className="flex items-center space-x-2 pt-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {documentation.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Content Display */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{documentation.content}</div>
          </div>

          {/* Source Feature Request Info */}
          {documentation.sourceFeatureRequest && (
            <Card className="mt-8 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Original Feature Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Title:</span>{' '}
                    {documentation.sourceFeatureRequest.title}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{' '}
                    <Badge variant="outline">
                      {documentation.sourceFeatureRequest.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Priority:</span>{' '}
                    <Badge variant="outline">
                      {documentation.sourceFeatureRequest.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>
                    <p className="mt-1 text-muted-foreground">
                      {documentation.sourceFeatureRequest.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}