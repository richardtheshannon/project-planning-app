"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, ExternalLink, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteFileAlert } from "./DeleteFileAlert";

// Define the shape of the file data including relations
export type FileWithDetails = {
  id: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: Date;
  project: { name: string } | null;
  uploader: { name: string | null } | null;
};

type SortKey = "mimetype" | "size" | "createdAt";
type SortDirection = "asc" | "desc";

interface DocumentsTableProps {
  files: FileWithDetails[];
}

// Helper function to format file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function DocumentsTable({ files: initialFiles }: DocumentsTableProps) {
  const [files, setFiles] = React.useState(initialFiles);
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<FileWithDetails | null>(null);

  const sortedFiles = React.useMemo(() => {
    return [...files].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [files, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (file: FileWithDetails) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/files`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: selectedFile.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      
      setFiles(files.filter(f => f.id !== selectedFile.id));
      setIsDeleteDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(key)}>
      <div className="flex items-center">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </div>
    </TableHead>
  );

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <SortableHeader sortKey="mimetype">File Type</SortableHeader>
              <SortableHeader sortKey="size">Size</SortableHeader>
              <SortableHeader sortKey="createdAt">Upload Date</SortableHeader>
              <TableHead>Project</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.originalName}</TableCell>
                <TableCell>{file.mimetype}</TableCell>
                <TableCell>{formatBytes(file.size)}</TableCell>
                <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{file.project?.name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <a href={file.path} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Open File
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(file)} className="text-red-600 focus:text-red-500 flex items-center cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sortedFiles.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg">No documents found.</p>
          </div>
        )}
      </div>
      <DeleteFileAlert
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        fileName={selectedFile?.originalName ?? null}
        isDeleting={isDeleting}
      />
    </>
  );
}
