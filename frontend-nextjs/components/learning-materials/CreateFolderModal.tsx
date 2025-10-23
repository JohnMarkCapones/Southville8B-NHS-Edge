/**
 * CreateFolderModal Component
 *
 * Modal for creating new folders in the learning materials system.
 * Includes form validation, parent folder selection, and error handling.
 *
 * @module components/learning-materials/CreateFolderModal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  X,
  Folder,
  FolderOpen,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { LearningMaterialFolder } from '@/lib/api/endpoints/learning-materials';

/**
 * Props for CreateFolderModal component
 */
export interface CreateFolderModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Callback when folder is created successfully */
  onCreateFolder: (data: { name: string; description?: string; parent_id?: string }) => Promise<void>;
  /** Array of existing folders for parent selection */
  folders: LearningMaterialFolder[];
  /** Currently selected folder (will be default parent) */
  currentFolderId?: string | null;
  /** Whether the creation is in progress */
  isCreating?: boolean;
}

/**
 * Form data interface
 */
interface FormData {
  name: string;
  description: string;
  parent_id: string;
}

/**
 * Form validation errors
 */
interface FormErrors {
  name?: string;
  description?: string;
  parent_id?: string;
  general?: string;
}

/**
 * Build hierarchical folder tree for parent selection
 */
function buildFolderTreeForSelection(folders: LearningMaterialFolder[]): LearningMaterialFolder[] {
  const folderMap = new Map<string, LearningMaterialFolder & { children: LearningMaterialFolder[] }>();
  const rootFolders: LearningMaterialFolder[] = [];

  // Create map of all folders
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Build tree structure
  folders.forEach(folder => {
    const folderWithChildren = folderMap.get(folder.id)!;
    
    if (folder.parent_id) {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children.push(folderWithChildren);
      }
    } else {
      rootFolders.push(folderWithChildren);
    }
  });

  return rootFolders;
}

/**
 * Render folder options for parent selection
 */
function renderFolderOptions(
  folders: LearningMaterialFolder[],
  level: number = 0,
  excludeId?: string
): React.ReactNode[] {
  return folders
    .filter(folder => folder.id !== excludeId) // Prevent self-parenting
    .map(folder => (
      <React.Fragment key={folder.id}>
        <SelectItem value={folder.id} className="pl-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 16}px` }}>
            <Folder className="h-4 w-4 text-slate-500" />
            <span>{folder.name}</span>
          </div>
        </SelectItem>
        {folder.children && folder.children.length > 0 && (
          <>
            {renderFolderOptions(folder.children, level + 1, excludeId)}
          </>
        )}
      </React.Fragment>
    ));
}

/**
 * Get folder path for display
 */
function getFolderPath(folderId: string, folders: LearningMaterialFolder[]): string {
  const path: string[] = [];
  let current = folders.find(f => f.id === folderId);
  
  while (current) {
    path.unshift(current.name);
    current = folders.find(f => f.id === current?.parent_id);
  }
  
  return path.join(' / ');
}

/**
 * CreateFolderModal component for creating new folders
 */
export function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
  folders,
  currentFolderId,
  isCreating = false,
}: CreateFolderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parent_id: currentFolderId || '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        parent_id: currentFolderId || '',
      });
      setErrors({});
    }
  }, [isOpen, currentFolderId]);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Folder name is required';
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Folder name must be less than 255 characters';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Folder name must be at least 2 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Parent validation (optional, but if provided must be valid)
    if (formData.parent_id && !folders.find(f => f.id === formData.parent_id)) {
      newErrors.parent_id = 'Selected parent folder is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onCreateFolder({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent_id: formData.parent_id || undefined,
      });
      
      // Success - modal will be closed by parent component
    } catch (error) {
      console.error('Error creating folder:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create folder. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Build folder tree for parent selection
  const folderTree = buildFolderTreeForSelection(folders);
  const selectedParent = folders.find(f => f.id === formData.parent_id);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Create New Folder
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {errors.general}
                </span>
              </div>
            )}

            {/* Folder Name */}
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-sm font-medium">
                Folder Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="folder-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter folder name"
                className={cn(errors.name && 'border-red-500 focus:border-red-500')}
                disabled={isSubmitting}
                maxLength={255}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="folder-description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="folder-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter folder description"
                className={cn(errors.description && 'border-red-500 focus:border-red-500')}
                disabled={isSubmitting}
                rows={3}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Parent Folder */}
            <div className="space-y-2">
              <Label htmlFor="parent-folder" className="text-sm font-medium">
                Parent Folder (Optional)
              </Label>
              <Select
                value={formData.parent_id || "root"}
                onValueChange={(value) => handleInputChange('parent_id', value === "root" ? "" : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={cn(errors.parent_id && 'border-red-500 focus:border-red-500')}>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-slate-500" />
                      <span>Root (Top Level)</span>
                    </div>
                  </SelectItem>
                  {renderFolderOptions(folderTree, 0, currentFolderId)}
                </SelectContent>
              </Select>
              
              {/* Show selected parent path */}
              {selectedParent && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ChevronRight className="h-3 w-3" />
                  <span>Will be created in: {getFolderPath(selectedParent.id, folders)}</span>
                </div>
              )}
              
              {errors.parent_id && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.parent_id}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Folder'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
