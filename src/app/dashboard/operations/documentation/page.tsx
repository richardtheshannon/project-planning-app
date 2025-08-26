'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  ArrowUpDown,
  Filter
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
  } | null;
}

export default function DocumentationPage() {
  const router = useRouter();
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'DEVELOPMENT', label: 'Development' },
    { value: 'PROJECTS', label: 'Projects' },
    { value: 'CLIENTS', label: 'Clients' },
    { value: 'OPERATIONS', label: 'Operations' },
    { value: 'FINANCIALS', label: 'Financials' },
    { value: 'SETTINGS', label: 'Settings' },
  ];

  useEffect(() => {
    fetchDocumentation();
  }, [search, category, sortBy, sortOrder, page]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);

      const response = await fetch(`/api/documentation?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documentation');

      const data = await response.json();
      setDocumentation(data.documentation);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching documentation:', error);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation?')) return;

    try {
      const response = await fetch(`/api/documentation/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete documentation');

      toast.success('Documentation deleted successfully');
      fetchDocumentation();
    } catch (error) {
      console.error('Error deleting documentation:', error);
      toast.error('Failed to delete documentation');
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Manage your knowledge base and documentation
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/operations/documentation/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Documentation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
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
        </CardContent>
      </Card>

      {/* Documentation Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading documentation...</div>
          ) : documentation.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documentation found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('updatedAt')}
                    >
                      <div className="flex items-center">
                        Updated
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentation.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(doc.category)}`}
                        >
                          {doc.category}
                        </span>
                      </TableCell>
                      <TableCell>{doc.user.name || doc.user.email}</TableCell>
                      <TableCell>{format(new Date(doc.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(doc.updatedAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {doc.sourceFeatureRequest ? (
                          <span className="text-sm text-muted-foreground">
                            FR: {doc.sourceFeatureRequest.title}
                          </span>
                        ) : (
                          'Manual'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/operations/documentation/${doc.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/operations/documentation/${doc.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}