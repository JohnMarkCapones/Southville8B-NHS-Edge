/**
 * useLearningMaterials Hook
 *
 * React hook for managing learning materials (teacher files).
 * Provides folder management, file operations, and analytics.
 *
 * @module hooks/useLearningMaterials
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
  uploadFile,
  updateFile,
  deleteFile,
  restoreFile,
  getFileDownloadUrl,
  getAnalyticsOverview,
  getPopularFiles,
  type LearningMaterialFolder,
  type LearningMaterialFile,
  type CreateFolderDto,
  type UpdateFolderDto,
  type UpdateFileDto,
  type FileQueryParams,
  type FolderQueryParams,
} from '@/lib/api/endpoints/learning-materials';

/**
 * Hook options
 */
export interface UseLearningMaterialsOptions {
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
export interface UseLearningMaterialsReturn {
  // Data
  folders: LearningMaterialFolder[];
  files: LearningMaterialFile[];
  currentFolder: LearningMaterialFolder | null;
  loading: boolean;
  error: Error | null;

  // Folder Management
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  createFolder: (data: CreateFolderDto) => Promise<LearningMaterialFolder>;
  updateFolder: (id: string, data: UpdateFolderDto) => Promise<LearningMaterialFolder>;
  deleteFolder: (id: string) => Promise<void>;
  restoreFolder: (id: string) => Promise<LearningMaterialFolder>;

  // File Management
  uploadFile: (folderId: string, file: File, metadata: { title: string; description?: string }) => Promise<LearningMaterialFile>;
  updateFile: (id: string, data: UpdateFileDto) => Promise<LearningMaterialFile>;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<LearningMaterialFile>;
  downloadFile: (id: string) => Promise<void>;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mimeTypeFilter: string;
  setMimeTypeFilter: (type: string) => void;

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
}

/**
 * Custom hook for managing learning materials with full CRUD support
 *
 * @param options - Hook configuration options
 * @returns Learning materials data, loading state, and CRUD functions
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
 *   deleteFile
 * } = useLearningMaterials({
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
export function useLearningMaterials(options: UseLearningMaterialsOptions = {}): UseLearningMaterialsReturn {
  const {
    enabled = true,
    initialFolderParams = {},
    initialFileParams = {},
    refetchInterval,
  } = options;

  // State
  const [folders, setFolders] = useState<LearningMaterialFolder[]>([]);
  const [files, setFiles] = useState<LearningMaterialFile[]>([]);
  const [currentFolderId, setCurrentFolderIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mimeTypeFilter, setMimeTypeFilter] = useState('');
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  // File query parameters
  const [fileParams, setFileParams] = useState<FileQueryParams>({
    page: 1,
    limit: 20,
    ...initialFileParams,
  });

  /**
   * Fetch folders from API
   */
  const fetchFolders = useCallback(async () => {
    if (!enabled) return;

    try {
      console.log('[useLearningMaterials] Fetching folders...');
      const foldersData = await getFolders(initialFolderParams);
      setFolders(foldersData);
      console.log('[useLearningMaterials] ✅ Fetched', foldersData.length, 'folders');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch folders');
      console.error('[useLearningMaterials] ❌ Error fetching folders:', errorObj);
      setError(errorObj);
    }
  }, [enabled, initialFolderParams]);

  /**
   * Fetch files from API
   */
  const fetchFiles = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[useLearningMaterials] Fetching files with params:', fileParams);
      const response = await getFiles(fileParams);

      setFiles(response.files);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });

      console.log('[useLearningMaterials] ✅ Fetched', response.files.length, 'files');
      console.log('[useLearningMaterials] Pagination:', response.totalPages, 'pages,', response.total, 'total');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch files');
      console.error('[useLearningMaterials] ❌ Error fetching files:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [enabled, fileParams]);

  /**
   * Set current folder ID and update file query
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
   * Create new folder
   */
  const handleCreateFolder = useCallback(
    async (data: CreateFolderDto): Promise<LearningMaterialFolder> => {
      console.log('[useLearningMaterials] Creating folder:', data.name);
      const newFolder = await createFolder(data);
      console.log('[useLearningMaterials] ✅ Folder created:', newFolder.id);
      await fetchFolders(); // Refetch to update tree
      return newFolder;
    },
    [fetchFolders]
  );

  /**
   * Update existing folder
   */
  const handleUpdateFolder = useCallback(
    async (id: string, data: UpdateFolderDto): Promise<LearningMaterialFolder> => {
      console.log('[useLearningMaterials] Updating folder:', id);
      const updatedFolder = await updateFolder(id, data);
      console.log('[useLearningMaterials] ✅ Folder updated');
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
      console.log('[useLearningMaterials] Deleting folder:', id);
      await deleteFolder(id);
      console.log('[useLearningMaterials] ✅ Folder deleted');
      await fetchFolders(); // Refetch to update tree
    },
    [fetchFolders]
  );

  /**
   * Restore deleted folder
   */
  const handleRestoreFolder = useCallback(
    async (id: string): Promise<LearningMaterialFolder> => {
      console.log('[useLearningMaterials] Restoring folder:', id);
      const restoredFolder = await restoreFolder(id);
      console.log('[useLearningMaterials] ✅ Folder restored');
      await fetchFolders(); // Refetch to update tree
      return restoredFolder;
    },
    [fetchFolders]
  );

  /**
   * Upload new file
   */
  const handleUploadFile = useCallback(
    async (
      folderId: string,
      file: File,
      metadata: { title: string; description?: string }
    ): Promise<LearningMaterialFile> => {
      console.log('[useLearningMaterials] Uploading file:', file.name);
      const newFile = await uploadFile(folderId, file, metadata);
      console.log('[useLearningMaterials] ✅ File uploaded:', newFile.id);
      await fetchFiles(); // Refetch to update list
      return newFile;
    },
    [fetchFiles]
  );

  /**
   * Update file metadata
   */
  const handleUpdateFile = useCallback(
    async (id: string, data: UpdateFileDto): Promise<LearningMaterialFile> => {
      console.log('[useLearningMaterials] Updating file:', id);
      const updatedFile = await updateFile(id, data);
      console.log('[useLearningMaterials] ✅ File updated');
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
      console.log('[useLearningMaterials] Deleting file:', id);
      await deleteFile(id);
      console.log('[useLearningMaterials] ✅ File deleted');
      await fetchFiles(); // Refetch to update list
    },
    [fetchFiles]
  );

  /**
   * Restore deleted file
   */
  const handleRestoreFile = useCallback(
    async (id: string): Promise<LearningMaterialFile> => {
      console.log('[useLearningMaterials] Restoring file:', id);
      const restoredFile = await restoreFile(id);
      console.log('[useLearningMaterials] ✅ File restored');
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
      try {
        console.log('[useLearningMaterials] Downloading file:', id);
        const { url } = await getFileDownloadUrl(id);
        console.log('[useLearningMaterials] ✅ Download URL generated');
        
        // Open download URL in new tab
        window.open(url, '_blank');
      } catch (err) {
        console.error('[useLearningMaterials] ❌ Download failed:', err);
        throw err;
      }
    },
    []
  );

  /**
   * Refetch all data
   */
  const refetch = useCallback(async () => {
    await Promise.all([fetchFolders(), fetchFiles()]);
  }, [fetchFolders, fetchFiles]);

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

  // Get current folder from folders array
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find(folder => folder.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  // Initial fetch folders on mount
  useEffect(() => {
    if (enabled) {
      fetchFolders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only run on mount and when enabled changes

  // Fetch files when params change
  useEffect(() => {
    if (enabled) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fileParams.page, fileParams.limit, fileParams.folderId, fileParams.search, fileParams.mimeType]); // Run when specific params change

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const intervalId = setInterval(() => {
      console.log('[useLearningMaterials] 🔄 Auto-refreshing...');
      refetch();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, refetch]);

  return {
    // Data
    folders,
    files,
    currentFolder,
    loading,
    error,

    // Folder Management
    currentFolderId,
    setCurrentFolderId,
    createFolder: handleCreateFolder,
    updateFolder: handleUpdateFolder,
    deleteFolder: handleDeleteFolder,
    restoreFolder: handleRestoreFolder,

    // File Management
    uploadFile: handleUploadFile,
    updateFile: handleUpdateFile,
    deleteFile: handleDeleteFile,
    restoreFile: handleRestoreFile,
    downloadFile: handleDownloadFile,

    // Filters & Search
    searchQuery,
    setSearchQuery: handleSearchQuery,
    mimeTypeFilter,
    setMimeTypeFilter: handleMimeTypeFilter,

    // Pagination
    pagination,
    setPage,
    setLimit,

    // Actions
    refetch,
    refetchFolders,
    refetchFiles,
  };
}
