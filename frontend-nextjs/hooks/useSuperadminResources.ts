/**
 * useSuperadminResources Hook
 *
 * React hook for managing superadmin resources (system-wide files and folders).
 * Provides comprehensive CRUD operations, analytics, and advanced features.
 *
 * @module hooks/useSuperadminResources
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFolders,
  getFiles,
  createFolder,
  updateFolder,
  deleteFolder,
  restoreFolder,
  moveFolder,
  uploadFile,
  updateFile,
  deleteFile,
  restoreFile,
  downloadFile,
  getAnalyticsOverview,
  getPopularFiles,
  bulkDeleteFiles,
  bulkMoveFiles,
  bulkUpdateVisibility,
  type SuperadminFolder,
  type SuperadminFile,
  type CreateFolderDto,
  type UpdateFolderDto,
  type UploadFileDto,
  type UpdateFileDto,
  type FileQueryParams,
  type FolderQueryParams,
  type AnalyticsOverview,
} from '@/lib/api/endpoints/superadmin-resources';

/**
 * Hook options
 */
export interface UseSuperadminResourcesOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial folder query parameters */
  initialFolderParams?: FolderQueryParams;
  /** Initial file query parameters */
  initialFileParams?: FileQueryParams;
  /** Auto-refetch interval in milliseconds (optional) */
  refetchInterval?: number;
}

/**
 * Hook return type
 */
export interface UseSuperadminResourcesReturn {
  // Data
  folders: SuperadminFolder[];
  files: SuperadminFile[];
  currentFolder: SuperadminFolder | null;
  analytics: AnalyticsOverview | null;
  loading: boolean;
  error: Error | null;

  // Folder Management
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  createFolder: (data: CreateFolderDto) => Promise<SuperadminFolder>;
  updateFolder: (id: string, data: UpdateFolderDto) => Promise<SuperadminFolder>;
  deleteFolder: (id: string) => Promise<void>;
  restoreFolder: (id: string) => Promise<SuperadminFolder>;
  moveFolder: (id: string, parentId: string) => Promise<SuperadminFolder>;

  // File Management
  uploadFile: (file: File, data: UploadFileDto) => Promise<SuperadminFile>;
  updateFile: (id: string, data: UpdateFileDto) => Promise<SuperadminFile>;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<SuperadminFile>;
  downloadFile: (id: string) => Promise<void>;

  // Bulk Operations
  bulkDeleteFiles: (ids: string[]) => Promise<{ message: string; deleted: number }>;
  bulkMoveFiles: (ids: string[], folderId: string) => Promise<{ message: string; moved: number }>;
  bulkUpdateVisibility: (ids: string[], visibility: string) => Promise<{ message: string; updated: number }>;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mimeTypeFilter: string;
  setMimeTypeFilter: (type: string) => void;
  visibilityFilter: string;
  setVisibilityFilter: (visibility: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Actions
  refetch: () => Promise<void>;
  refetchFolders: () => Promise<void>;
  refetchFiles: () => Promise<void>;
  refetchAnalytics: () => Promise<void>;
}

/**
 * Custom hook for managing superadmin resources with full CRUD support
 *
 * @param options - Hook configuration options
 * @returns Superadmin resources data, loading state, and CRUD functions
 *
 * @example
 * ```typescript
 * const {
 *   folders,
 *   files,
 *   currentFolder,
 *   loading,
 *   error,
 *   setCurrentFolderId,
 *   uploadFile,
 *   downloadFile,
 *   deleteFile,
 *   getAnalytics
 * } = useSuperadminResources({
 *   initialFileParams: {
 *     page: 1,
 *     limit: 20
 *   }
 * });
 *
 * // Use in component
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     <FolderTree folders={folders} onFolderSelect={setCurrentFolderId} />
 *     <FileGrid files={files} onDownload={downloadFile} />
 *   </div>
 * );
 * ```
 */
export function useSuperadminResources(options: UseSuperadminResourcesOptions = {}): UseSuperadminResourcesReturn {
  const {
    enabled = true,
    initialFolderParams = {},
    initialFileParams = {},
    refetchInterval,
  } = options;

  // State management
  const [folders, setFolders] = useState<SuperadminFolder[]>([]);
  const [files, setFiles] = useState<SuperadminFile[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Current folder state
  const [currentFolderId, setCurrentFolderIdState] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeTypeFilter, setMimeTypeFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // Query parameters
  const [folderParams, setFolderParams] = useState<FolderQueryParams>(initialFolderParams);
  const [fileParams, setFileParams] = useState<FileQueryParams>({
    page: 1,
    limit: 12,
    ...initialFileParams,
  });

  /**
   * Set current folder ID and update file params
   */
  const setCurrentFolderId = useCallback((id: string | null) => {
    setCurrentFolderIdState(id);
    setFileParams(prev => ({
      ...prev,
      folderId: id || undefined,
      page: 1, // Reset to page 1 when changing folders
    }));
  }, []);

  /**
   * Update search query
   */
  const handleSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setFileParams(prev => ({
      ...prev,
      search: query || undefined,
      page: 1, // Reset to page 1 when searching
    }));
  }, []);

  /**
   * Update MIME type filter
   */
  const handleMimeTypeFilter = useCallback((type: string) => {
    setMimeTypeFilter(type);
    setFileParams(prev => ({
      ...prev,
      mimeType: type || undefined,
      page: 1, // Reset to page 1 when filtering
    }));
  }, []);

  /**
   * Update visibility filter
   */
  const handleVisibilityFilter = useCallback((visibility: string) => {
    setVisibilityFilter(visibility);
    setFileParams(prev => ({
      ...prev,
      visibility: visibility || undefined,
      page: 1, // Reset to page 1 when filtering
    }));
  }, []);

  /**
   * Update sort parameters
   */
  const handleSortBy = useCallback((sort: string) => {
    setSortBy(sort);
    setFileParams(prev => ({
      ...prev,
      sortBy: sort,
      page: 1, // Reset to page 1 when sorting
    }));
  }, []);

  const handleSortOrder = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
    setFileParams(prev => ({
      ...prev,
      sortOrder: order,
      page: 1, // Reset to page 1 when sorting
    }));
  }, []);

  /**
   * Set page number
   */
  const setPage = useCallback((page: number) => {
    setFileParams(prev => ({ ...prev, page }));
  }, []);

  /**
   * Set items per page
   */
  const setLimit = useCallback((limit: number) => {
    setFileParams(prev => ({
      ...prev,
      limit,
      page: 1, // Reset to page 1 when changing limit
    }));
  }, []);

  /**
   * Flatten folder tree structure to flat array
   */
  const flattenFolders = (folders: SuperadminFolder[]): SuperadminFolder[] => {
    const flattened: SuperadminFolder[] = [];

    const flatten = (folder: SuperadminFolder) => {
      // Add the folder itself
      flattened.push(folder);

      // Recursively add children if they exist
      if ((folder as any).children && Array.isArray((folder as any).children)) {
        (folder as any).children.forEach((child: SuperadminFolder) => flatten(child));
      }
    };

    folders.forEach(folder => flatten(folder));
    return flattened;
  };

  /**
   * Fetch folders
   */
  const fetchFolders = useCallback(async () => {
    try {
      console.log('[useSuperadminResources] Fetching folders...');
      const data = await getFolders(folderParams);
      console.log('[useSuperadminResources] ✅ Folders fetched (tree):', data.length);

      // Flatten the tree structure to a flat array
      const flattenedFolders = flattenFolders(data);
      console.log('[useSuperadminResources] ✅ Folders flattened:', flattenedFolders.length);

      setFolders(flattenedFolders);
    } catch (err) {
      console.error('[useSuperadminResources] ❌ Error fetching folders:', err);
      setError(err as Error);
    }
  }, [folderParams]);

  /**
   * Fetch files
   */
  const fetchFiles = useCallback(async () => {
    try {
      console.log('[useSuperadminResources] Fetching files...', fileParams);
      const data = await getFiles(fileParams);
      console.log('[useSuperadminResources] ✅ Files fetched:', data.files.length);
      setFiles(data.files);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('[useSuperadminResources] ❌ Error fetching files:', err);
      setError(err as Error);
    }
  }, [fileParams]);

  /**
   * Fetch analytics
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      console.log('[useSuperadminResources] Fetching analytics...');
      const data = await getAnalyticsOverview();
      console.log('[useSuperadminResources] ✅ Analytics fetched');
      setAnalytics(data);
    } catch (err) {
      console.error('[useSuperadminResources] ❌ Error fetching analytics:', err);
      // Don't set error for analytics as it's not critical
    }
  }, []);

  /**
   * Create new folder
   */
  const handleCreateFolder = useCallback(
    async (data: CreateFolderDto): Promise<SuperadminFolder> => {
      console.log('[useSuperadminResources] Creating folder:', data.name);
      const newFolder = await createFolder(data);
      console.log('[useSuperadminResources] ✅ Folder created:', newFolder.id);
      await fetchFolders(); // Refetch to update tree
      return newFolder;
    },
    [fetchFolders]
  );

  /**
   * Update existing folder
   */
  const handleUpdateFolder = useCallback(
    async (id: string, data: UpdateFolderDto): Promise<SuperadminFolder> => {
      console.log('[useSuperadminResources] Updating folder:', id);
      const updatedFolder = await updateFolder(id, data);
      console.log('[useSuperadminResources] ✅ Folder updated');
      await fetchFolders(); // Refetch to update tree
      return updatedFolder;
    },
    [fetchFolders]
  );

  /**
   * Delete folder (soft delete)
   */
  const handleDeleteFolder = useCallback(
    async (id: string): Promise<void> => {
      console.log('[useSuperadminResources] Deleting folder:', id);
      await deleteFolder(id);
      console.log('[useSuperadminResources] ✅ Folder deleted');
      await fetchFolders(); // Refetch to update tree
    },
    [fetchFolders]
  );

  /**
   * Restore deleted folder
   */
  const handleRestoreFolder = useCallback(
    async (id: string): Promise<SuperadminFolder> => {
      console.log('[useSuperadminResources] Restoring folder:', id);
      const restoredFolder = await restoreFolder(id);
      console.log('[useSuperadminResources] ✅ Folder restored');
      await fetchFolders(); // Refetch to update tree
      return restoredFolder;
    },
    [fetchFolders]
  );

  /**
   * Move folder to different parent
   */
  const handleMoveFolder = useCallback(
    async (id: string, parentId: string): Promise<SuperadminFolder> => {
      console.log('[useSuperadminResources] Moving folder:', id, 'to', parentId);
      const movedFolder = await moveFolder(id, parentId);
      console.log('[useSuperadminResources] ✅ Folder moved');
      await fetchFolders(); // Refetch to update tree
      return movedFolder;
    },
    [fetchFolders]
  );

  /**
   * Upload file
   */
  const handleUploadFile = useCallback(
    async (file: File, data: UploadFileDto): Promise<SuperadminFile> => {
      console.log('[useSuperadminResources] Uploading file:', file.name);
      const newFile = await uploadFile(file, data);
      console.log('[useSuperadminResources] ✅ File uploaded:', newFile.id);
      await fetchFiles(); // Refetch to update list
      return newFile;
    },
    [fetchFiles]
  );

  /**
   * Update file metadata
   */
  const handleUpdateFile = useCallback(
    async (id: string, data: UpdateFileDto): Promise<SuperadminFile> => {
      console.log('[useSuperadminResources] Updating file:', id);
      const updatedFile = await updateFile(id, data);
      console.log('[useSuperadminResources] ✅ File updated');
      await fetchFiles(); // Refetch to update list
      return updatedFile;
    },
    [fetchFiles]
  );

  /**
   * Delete file (soft delete)
   */
  const handleDeleteFile = useCallback(
    async (id: string): Promise<void> => {
      console.log('[useSuperadminResources] Deleting file:', id);
      await deleteFile(id);
      console.log('[useSuperadminResources] ✅ File deleted');
      await fetchFiles(); // Refetch to update list
    },
    [fetchFiles]
  );

  /**
   * Restore deleted file
   */
  const handleRestoreFile = useCallback(
    async (id: string): Promise<SuperadminFile> => {
      console.log('[useSuperadminResources] Restoring file:', id);
      const restoredFile = await restoreFile(id);
      console.log('[useSuperadminResources] ✅ File restored');
      await fetchFiles(); // Refetch to update list
      return restoredFile;
    },
    [fetchFiles]
  );

  /**
   * Download file
   */
  const handleDownloadFile = useCallback(
    async (id: string): Promise<void> => {
      console.log('[useSuperadminResources] Downloading file:', id);
      await downloadFile(id);
      console.log('[useSuperadminResources] ✅ File download initiated');
      // Refetch files to update download count
      await fetchFiles();
    },
    [fetchFiles]
  );

  /**
   * Bulk delete files
   */
  const handleBulkDeleteFiles = useCallback(
    async (ids: string[]): Promise<{ message: string; deleted: number }> => {
      console.log('[useSuperadminResources] Bulk deleting files:', ids.length);
      const result = await bulkDeleteFiles(ids);
      console.log('[useSuperadminResources] ✅ Files bulk deleted:', result.deleted);
      await fetchFiles(); // Refetch to update list
      return result;
    },
    [fetchFiles]
  );

  /**
   * Bulk move files
   */
  const handleBulkMoveFiles = useCallback(
    async (ids: string[], folderId: string): Promise<{ message: string; moved: number }> => {
      console.log('[useSuperadminResources] Bulk moving files:', ids.length, 'to', folderId);
      const result = await bulkMoveFiles(ids, folderId);
      console.log('[useSuperadminResources] ✅ Files bulk moved:', result.moved);
      await fetchFiles(); // Refetch to update list
      return result;
    },
    [fetchFiles]
  );

  /**
   * Bulk update visibility
   */
  const handleBulkUpdateVisibility = useCallback(
    async (ids: string[], visibility: string): Promise<{ message: string; updated: number }> => {
      console.log('[useSuperadminResources] Bulk updating visibility:', ids.length, 'to', visibility);
      const result = await bulkUpdateVisibility(ids, visibility);
      console.log('[useSuperadminResources] ✅ Files bulk visibility updated:', result.updated);
      await fetchFiles(); // Refetch to update list
      return result;
    },
    [fetchFiles]
  );

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchFolders(),
        fetchFiles(),
        fetchAnalytics(),
      ]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFolders, fetchFiles, fetchAnalytics]);

  /**
   * Refetch folders only
   */
  const refetchFolders = useCallback(async () => {
    await fetchFolders();
  }, [fetchFolders]);

  /**
   * Refetch files only
   */
  const refetchFiles = useCallback(async () => {
    await fetchFiles();
  }, [fetchFiles]);

  /**
   * Refetch analytics only
   */
  const refetchAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Get current folder
   */
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find(f => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  // Initial data fetch
  useEffect(() => {
    if (enabled) {
      refetch();
    }
  }, [enabled, refetch]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(refetch, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, refetch]);

  return {
    // Data
    folders,
    files,
    currentFolder,
    analytics,
    loading,
    error,

    // Folder Management
    currentFolderId,
    setCurrentFolderId,
    createFolder: handleCreateFolder,
    updateFolder: handleUpdateFolder,
    deleteFolder: handleDeleteFolder,
    restoreFolder: handleRestoreFolder,
    moveFolder: handleMoveFolder,

    // File Management
    uploadFile: handleUploadFile,
    updateFile: handleUpdateFile,
    deleteFile: handleDeleteFile,
    restoreFile: handleRestoreFile,
    downloadFile: handleDownloadFile,

    // Bulk Operations
    bulkDeleteFiles: handleBulkDeleteFiles,
    bulkMoveFiles: handleBulkMoveFiles,
    bulkUpdateVisibility: handleBulkUpdateVisibility,

    // Filters & Search
    searchQuery,
    setSearchQuery: handleSearchQuery,
    mimeTypeFilter,
    setMimeTypeFilter: handleMimeTypeFilter,
    visibilityFilter,
    setVisibilityFilter: handleVisibilityFilter,
    sortBy,
    setSortBy: handleSortBy,
    sortOrder,
    setSortOrder: handleSortOrder,

    // Pagination
    pagination,
    setPage,
    setLimit,

    // Actions
    refetch,
    refetchFolders,
    refetchFiles,
    refetchAnalytics,
  };
}
