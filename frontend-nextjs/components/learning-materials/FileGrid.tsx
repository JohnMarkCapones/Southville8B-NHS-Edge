/**
 * FileGrid Component
 *
 * Grid display component for learning material files.
 * Supports grid and list views with file operations.
 *
 * @module components/learning-materials/FileGrid
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image,
  Video,
  Music,
  File,
  Grid3X3,
  List,
  Star,
  Clock,
} from 'lucide-react';
import type { LearningMaterialFile } from '@/lib/api/endpoints/learning-materials';

/**
 * Props for FileGrid component
 */
export interface FileGridProps {
  /** Array of files to display */
  files: LearningMaterialFile[];
  /** Whether data is loading */
  loading?: boolean;
  /** Current view mode */
  viewMode?: 'grid' | 'list';
  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Callback when file is downloaded */
  onDownload: (file: LearningMaterialFile) => void;
  /** Callback when file is viewed */
  onView?: (file: LearningMaterialFile) => void;
  /** Callback when file is edited */
  onEdit?: (file: LearningMaterialFile) => void;
  /** Callback when file is deleted */
  onDelete?: (file: LearningMaterialFile) => void;
  /** Whether to show selection checkboxes */
  showSelection?: boolean;
  /** Selected file IDs */
  selectedFiles?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (fileIds: string[]) => void;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Get file icon based on MIME type
 */
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return <Image className="h-5 w-5 text-green-500" />;
  }
  if (mimeType.startsWith('video/')) {
    return <Video className="h-5 w-5 text-purple-500" />;
  }
  if (mimeType.startsWith('audio/')) {
    return <Music className="h-5 w-5 text-pink-500" />;
  }
  if (mimeType.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  }
  if (mimeType.includes('zip') || mimeType.includes('rar')) {
    return <FileArchive className="h-5 w-5 text-orange-500" />;
  }
  return <File className="h-5 w-5 text-slate-500" />;
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
 * Format date in relative format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Individual file card component
 */
function FileCard({
  file,
  viewMode,
  showSelection,
  isSelected,
  onSelect,
  onDownload,
  onView,
  onEdit,
  onDelete,
}: {
  file: LearningMaterialFile;
  viewMode: 'grid' | 'list';
  showSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDownload: (file: LearningMaterialFile) => void;
  onView?: (file: LearningMaterialFile) => void;
  onEdit?: (file: LearningMaterialFile) => void;
  onDelete?: (file: LearningMaterialFile) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Checkbox */}
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="flex-shrink-0"
              />
            )}

            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(file.mime_type)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{file.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {file.original_filename}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  {formatFileSize(file.file_size_bytes)}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  {formatDate(file.created_at)}
                </span>
                {file.download_count && file.download_count > 0 && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {file.download_count} downloads
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(file)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(file)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(file)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(file)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        isSelected && 'ring-2 ring-primary'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onDownload(file)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          {/* Selection Checkbox */}
          {showSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* File Icon */}
          <div className="flex-1 flex justify-center">
            {getFileIcon(file.mime_type)}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(file)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(file)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(file)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate" title={file.title}>
            {file.title}
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={file.original_filename}>
            {file.original_filename}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{formatFileSize(file.file_size_bytes)}</span>
            <span>{formatDate(file.created_at)}</span>
          </div>

          {file.download_count && file.download_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Download className="h-3 w-3" />
              <span>{file.download_count}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * FileGrid component for displaying learning material files
 */
export function FileGrid({
  files,
  loading = false,
  viewMode = 'grid',
  onViewModeChange,
  onDownload,
  onView,
  onEdit,
  onDelete,
  showSelection = false,
  selectedFiles = [],
  onSelectionChange,
  className,
}: FileGridProps) {
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(viewMode);

  const currentViewMode = onViewModeChange ? viewMode : internalViewMode;

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const handleFileSelect = (fileId: string, selected: boolean) => {
    if (!onSelectionChange) return;

    if (selected) {
      onSelectionChange([...selectedFiles, fileId]);
    } else {
      onSelectionChange(selectedFiles.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (!onSelectionChange) return;

    if (selected) {
      onSelectionChange(files.map(file => file.id));
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected = files.length > 0 && selectedFiles.length === files.length;
  const someSelected = selectedFiles.length > 0 && selectedFiles.length < files.length;

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4 pb-2">
                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showSelection && files.length > 0 && (
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onCheckedChange={handleSelectAll}
            />
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={currentViewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Files Grid/List */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No files found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Upload some files to get started
          </p>
        </div>
      ) : (
        <div
          className={
            currentViewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          }
        >
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              viewMode={currentViewMode}
              showSelection={showSelection}
              isSelected={selectedFiles.includes(file.id)}
              onSelect={(selected) => handleFileSelect(file.id, selected)}
              onDownload={onDownload}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
