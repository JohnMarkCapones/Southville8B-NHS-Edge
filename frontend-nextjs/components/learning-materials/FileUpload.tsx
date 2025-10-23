/**
 * FileUpload Component
 *
 * Drag and drop file upload component for learning materials.
 * Supports multiple file uploads with progress tracking.
 *
 * @module components/learning-materials/FileUpload
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  CloudUpload,
  Loader2,
} from 'lucide-react';

/**
 * Props for FileUpload component
 */
export interface FileUploadProps {
  /** Target folder ID for uploads */
  folderId: string;
  /** Callback when files are uploaded */
  onUpload: (files: File[], metadata: { title: string; description?: string }) => Promise<void>;
  /** Whether upload is in progress */
  uploading?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Allowed MIME types */
  allowedTypes?: string[];
  /** Custom CSS classes */
  className?: string;
}

/**
 * Upload file item interface
 */
interface UploadFileItem {
  id: string;
  file: File;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on MIME type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <FileText className="h-4 w-4 text-green-500" />;
  }
  if (mimeType.startsWith('video/')) {
    return <FileText className="h-4 w-4 text-purple-500" />;
  }
  if (mimeType.includes('pdf')) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }
  return <FileText className="h-4 w-4 text-slate-500" />;
}

/**
 * FileUpload component for drag and drop file uploads
 */
export function FileUpload({
  folderId,
  onUpload,
  uploading = false,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
  ],
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFileItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file before adding to upload queue
   */
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  };

  /**
   * Add files to upload queue
   */
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newUploadFiles: UploadFileItem[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        // Show error for invalid files
        console.error('File validation error:', error);
        return;
      }

      const uploadFile: UploadFileItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        progress: 0,
        status: 'pending',
      };

      newUploadFiles.push(uploadFile);
    });

    if (newUploadFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...newUploadFiles]);
      setShowUploadModal(true);
    }
  }, [maxFileSize, allowedTypes]);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  /**
   * Handle click to open file dialog
   */
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Update file metadata
   */
  const updateFileMetadata = useCallback((id: string, updates: Partial<Pick<UploadFileItem, 'title' | 'description'>>) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    );
  }, []);

  /**
   * Remove file from upload queue
   */
  const removeFile = useCallback((id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  /**
   * Start upload process
   */
  const startUpload = useCallback(async () => {
    if (uploadFiles.length === 0) return;

    // Update all files to uploading status
    setUploadFiles(prev => 
      prev.map(file => ({ ...file, status: 'uploading' as const, progress: 0 }))
    );

    try {
      // Upload files one by one
      for (const uploadFile of uploadFiles) {
        try {
          // Simulate progress (in real implementation, this would be actual upload progress)
          const progressInterval = setInterval(() => {
            setUploadFiles(prev => 
              prev.map(file => 
                file.id === uploadFile.id 
                  ? { ...file, progress: Math.min(file.progress + 10, 90) }
                  : file
              )
            );
          }, 100);

          // Call actual upload function
          await onUpload([uploadFile.file], {
            title: uploadFile.title,
            description: uploadFile.description,
          });

          clearInterval(progressInterval);

          // Mark as success
          setUploadFiles(prev => 
            prev.map(file => 
              file.id === uploadFile.id 
                ? { ...file, status: 'success' as const, progress: 100 }
                : file
            )
          );
        } catch (error) {
          // Mark as error
          setUploadFiles(prev => 
            prev.map(file => 
              file.id === uploadFile.id 
                ? { 
                    ...file, 
                    status: 'error' as const, 
                    error: error instanceof Error ? error.message : 'Upload failed'
                  }
                : file
            )
          );
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploadFiles, onUpload]);

  /**
   * Clear completed uploads
   */
  const clearCompleted = useCallback(() => {
    setUploadFiles(prev => prev.filter(file => file.status === 'pending' || file.status === 'uploading'));
  }, []);

  /**
   * Close upload modal
   */
  const closeUploadModal = useCallback(() => {
    setShowUploadModal(false);
    setUploadFiles([]);
  }, []);

  return (
    <>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          uploading && 'pointer-events-none opacity-50',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <CloudUpload className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Drag and drop files here, or click to browse
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span>Max size: {formatFileSize(maxFileSize)}</span>
            <span>•</span>
            <span>Supported: PDF, DOC, XLS, PPT, Images</span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="mt-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upload Files</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeUploadModal}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(uploadFile.file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {uploadFile.status === 'error' && (
                    <p className="text-sm text-red-600">
                      {uploadFile.error}
                    </p>
                  )}

                  {uploadFile.status === 'uploading' && (
                    <div className="space-y-2">
                      <Progress value={uploadFile.progress} className="h-2" />
                      <p className="text-xs text-slate-500">
                        Uploading... {uploadFile.progress}%
                      </p>
                    </div>
                  )}

                  {(uploadFile.status === 'pending' || uploadFile.status === 'uploading') && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`title-${uploadFile.id}`} className="text-sm">
                          Title
                        </Label>
                        <Input
                          id={`title-${uploadFile.id}`}
                          value={uploadFile.title}
                          onChange={(e) => updateFileMetadata(uploadFile.id, { title: e.target.value })}
                          placeholder="Enter file title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${uploadFile.id}`} className="text-sm">
                          Description (optional)
                        </Label>
                        <Textarea
                          id={`description-${uploadFile.id}`}
                          value={uploadFile.description}
                          onChange={(e) => updateFileMetadata(uploadFile.id, { description: e.target.value })}
                          placeholder="Enter file description"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>

            <div className="px-6 pb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {uploadFiles.filter(f => f.status === 'success').length} completed
                </Badge>
                <Badge variant="outline">
                  {uploadFiles.filter(f => f.status === 'pending').length} pending
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={clearCompleted}
                  disabled={uploading}
                >
                  Clear Completed
                </Button>
                <Button
                  onClick={startUpload}
                  disabled={uploading || uploadFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Start Upload'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
