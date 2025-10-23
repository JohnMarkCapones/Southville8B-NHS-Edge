/**
 * FolderTree Component
 *
 * Hierarchical folder navigation component for learning materials.
 * Displays folder tree with expand/collapse functionality.
 *
 * @module components/learning-materials/FolderTree
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Home,
  Plus,
} from 'lucide-react';
import type { LearningMaterialFolder } from '@/lib/api/endpoints/learning-materials';

/**
 * Props for FolderTree component
 */
export interface FolderTreeProps {
  /** Array of folders to display */
  folders: LearningMaterialFolder[];
  /** Currently selected folder ID */
  currentFolderId: string | null;
  /** Callback when folder is selected */
  onFolderSelect: (folderId: string | null) => void;
  /** Whether to show root folder */
  showRoot?: boolean;
  /** Whether to show new folder button */
  showNewFolderButton?: boolean;
  /** Callback when new folder button is clicked */
  onNewFolderClick?: () => void;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Props for individual folder node
 */
interface FolderNodeProps {
  folder: LearningMaterialFolder;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  level: number;
}

/**
 * Individual folder node component
 */
function FolderNode({
  folder,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  level,
}: FolderNodeProps) {
  const hasChildren = folder.children && folder.children.length > 0;
  const indentLevel = level * 20; // 20px per level

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          isSelected && 'bg-primary/10 text-primary',
          'group'
        )}
        style={{ paddingLeft: `${indentLevel + 12}px` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="h-4 w-4" /> // Spacer for alignment
        )}

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <Folder className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300" />
          )}
        </div>

        {/* Folder Name */}
        <span className="flex-1 truncate text-sm font-medium">
          {folder.name}
        </span>

        {/* File Count Badge */}
        {folder.file_count !== undefined && folder.file_count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {folder.file_count}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Build hierarchical folder tree from flat array
 */
function buildFolderTree(folders: LearningMaterialFolder[]): LearningMaterialFolder[] {
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
 * Recursive folder tree renderer
 */
function renderFolderTree(
  folders: LearningMaterialFolder[],
  expandedFolders: Set<string>,
  currentFolderId: string | null,
  onFolderSelect: (folderId: string | null) => void,
  onToggleFolder: (folderId: string) => void,
  level: number = 0
): React.ReactNode[] {
  return folders.map(folder => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <FolderNode
          folder={folder}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onSelect={() => onFolderSelect(folder.id)}
          onToggle={() => onToggleFolder(folder.id)}
          level={level}
        />
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div>
            {renderFolderTree(
              folder.children!,
              expandedFolders,
              currentFolderId,
              onFolderSelect,
              onToggleFolder,
              level + 1
            )}
          </div>
        )}
      </div>
    );
  });
}

/**
 * FolderTree component for hierarchical folder navigation
 */
export function FolderTree({
  folders,
  currentFolderId,
  onFolderSelect,
  showRoot = false,
  showNewFolderButton = false,
  onNewFolderClick,
  className,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Build hierarchical tree from flat array
  const folderTree = useMemo(() => {
    return buildFolderTree(folders);
  }, [folders]);

  // Auto-expand folders that contain the current folder
  useMemo(() => {
    if (currentFolderId) {
      const expandPath = (folder: LearningMaterialFolder, path: string[] = []): string[] => {
        if (folder.id === currentFolderId) {
          return path;
        }
        
        if (folder.children) {
          for (const child of folder.children) {
            const result = expandPath(child, [...path, folder.id]);
            if (result.length > 0) {
              return result;
            }
          }
        }
        
        return [];
      };

      const pathToExpand = folderTree.flatMap(folder => expandPath(folder));
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        pathToExpand.forEach(folderId => newSet.add(folderId));
        return newSet;
      });
    }
  }, [currentFolderId, folderTree]);

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderSelect = (folderId: string | null) => {
    onFolderSelect(folderId);
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* New Folder Button */}
      {showNewFolderButton && onNewFolderClick && (
        <div className="px-3 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewFolderClick}
            className="w-full justify-start gap-2 h-8"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">New Folder</span>
          </Button>
        </div>
      )}

      {/* Root/Home option */}
      {showRoot && (
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            currentFolderId === null && 'bg-primary/10 text-primary',
            'group'
          )}
          onClick={() => handleFolderSelect(null)}
        >
          <Home className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300" />
          <span className="text-sm font-medium">All Files</span>
        </div>
      )}

      {/* Folder Tree */}
      {renderFolderTree(
        folderTree,
        expandedFolders,
        currentFolderId,
        handleFolderSelect,
        handleToggleFolder
      )}

      {/* Empty state */}
      {folderTree.length === 0 && (
        <div className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No folders available</p>
        </div>
      )}
    </div>
  );
}
