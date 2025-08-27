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
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Documentation</h1>
            <p className="text-muted-foreground mt-1">
              Manage your knowledge base and documentation
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/operations/documentation/new')}
            className="self-start sm:self-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Documentation
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documentation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 h-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-[200px]">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full h-10">
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
            </div>
          </CardContent>
        </Card>

        {/* Documentation Content */}
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
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
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
                </div>

                {/* Tablet Horizontal Scroll Table */}
                <div className="hidden md:block lg:hidden">
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer min-w-[200px]"
                            onClick={() => toggleSort('title')}
                          >
                            <div className="flex items-center">
                              Title
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[120px]">Category</TableHead>
                          <TableHead className="min-w-[150px]">Author</TableHead>
                          <TableHead 
                            className="cursor-pointer min-w-[120px]"
                            onClick={() => toggleSort('updatedAt')}
                          >
                            <div className="flex items-center">
                              Updated
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="text-right min-w-[120px]">Actions</TableHead>
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
                            <TableCell>{format(new Date(doc.updatedAt), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
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
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                  {documentation.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {/* Card Header */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight flex-1">
                            {doc.title}
                          </h3>
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap ${getCategoryColor(doc.category)}`}
                          >
                            {doc.category}
                          </span>
                        </div>
                        
                        {/* Card Body */}
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                            <span>
                              <span className="font-medium">Author:</span> {doc.user.name || doc.user.email}
                            </span>
                            <span>
                              <span className="font-medium">Updated:</span> {format(new Date(doc.updatedAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(doc.sourceFeatureRequest || doc.createdAt !== doc.updatedAt) && (
                        <div className="text-sm text-muted-foreground">
                          {doc.sourceFeatureRequest && (
                            <p>
                              <span className="font-medium">Source:</span> FR: {doc.sourceFeatureRequest.title}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Created:</span> {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                      
                      {/* Card Footer */}
                      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          variant="default" 
                          className="flex-1 min-h-[44px] py-3 px-4 text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          onClick={() => router.push(`/dashboard/operations/documentation/${doc.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Document
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 min-h-[44px] py-3 px-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          onClick={() => router.push(`/dashboard/operations/documentation/${doc.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 min-h-[44px] py-3 px-4 text-sm font-medium border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden">Delete</span>
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}