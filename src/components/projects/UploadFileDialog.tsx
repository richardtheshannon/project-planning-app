"use client";

import { useState, useRef, DragEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFile {
  id: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

interface UploadFileDialogProps {
  projectId: string;
  onFileUploaded: (newFile: ProjectFile) => void;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/zip',
  'application/x-rar-compressed',
];

// Fallback check for file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.zip', '.rar'];


export function UploadFileDialog({ projectId, onFileUploaded }: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Primary check: MIME type. If it's empty, use the fallback extension check.
    const isTypeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isTypeAllowed && !isExtensionAllowed) {
       toast({
        title: "Invalid File Type",
        description: `Files of type "${file.name.split('.').pop()}" are not allowed.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 50 * 1024 * 1024) { 
      toast({
        title: "File Too Large",
        description: "The file size cannot exceed 50MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleFileSelected = (file: File | null) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(event.target.files?.[0] || null);
  };
  
  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    handleFileSelected(e.dataTransfer.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please choose a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projectId", projectId);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File upload failed");
      }

      const newFile: ProjectFile = await response.json();

      toast({
        title: "Success!",
        description: `File "${newFile.originalName}" uploaded successfully.`,
      });
      
      onFileUploaded(newFile);
      resetAndClose();

    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <UploadCloud className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => {
        if (isUploading) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>Upload a New File</DialogTitle>
          <DialogDescription>
            Select a file from your computer to add to this project.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors",
              { "border-primary bg-primary/10": isDragging }
            )}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="text-center">
                <FileIcon className="w-12 h-12 mx-auto text-primary" />
                <p className="mt-2 font-semibold">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <UploadCloud className="w-12 h-12 mx-auto" />
                <p className="mt-2">Click to browse or drag & drop</p>
                <p className="text-xs">PDF, DOCX, XLSX, JPG, PNG, ZIP, etc.</p>
              </div>
            )}
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
              accept={[...ALLOWED_MIME_TYPES, ...ALLOWED_EXTENSIONS].join(',')}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetAndClose} disabled={isUploading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
