"use client";

import { useState, useEffect, useCallback } from 'react';
import { Document } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import DocumentsTable from './DocumentsTable';
import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch documents from our new API endpoint
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents.');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch documents when the component mounts
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handler for when a new document is successfully uploaded
  const handleUploadSuccess = () => {
    fetchDocuments(); // Re-fetch the list to include the new document
  };

  // Handler for deleting a document
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document.');
      }

      // If successful, remove the document from the local state for an immediate UI update
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

    } catch (err: any) {
      // In a real app, you'd want to show this error to the user in a toast notification
      console.error(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Documents</h2>
          <p className="text-muted-foreground">
            Browse and manage all of your uploaded files.
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {isLoading && <p>Loading documents...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <DocumentsTable documents={documents} onDelete={handleDeleteDocument} />
      )}

      <UploadDocumentDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
