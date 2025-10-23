/**
 * useModules Hook
 *
 * React hook for fetching and managing educational modules.
 * Provides CRUD operations, pagination, filtering, and search functionality.
 *
 * @module hooks/useModules
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule,
  uploadModuleFile,
  assignModuleToSections,
  type Module,
  type ModuleQueryParams,
  type ModuleListResponse,
  type CreateModuleDto,
  type UpdateModuleDto,
} from '@/lib/api/endpoints/modules';

/**
 * Hook options
 */
export interface UseModulesOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial query parameters */
  initialParams?: ModuleQueryParams;
  /** Auto-refetch interval in milliseconds (optional) */
  refetchInterval?: number;
}

/**
 * Hook return type
 */
export interface UseModulesReturn {
  // Data
  modules: Module[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: Error | null;

  // Filters & Pagination
  params: ModuleQueryParams;
  setParams: (params: Partial<ModuleQueryParams>) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // CRUD Operations
  refetch: () => Promise<void>;
  createModule: (data: CreateModuleDto, file: File) => Promise<Module>;
  updateModule: (id: string, data: UpdateModuleDto) => Promise<Module>;
  deleteModule: (id: string) => Promise<void>;
  uploadFile: (id: string, file: File) => Promise<Module>;
  assignToSections: (id: string, sectionIds: string[]) => Promise<void>;
}

/**
 * Custom hook for managing modules with full CRUD support
 *
 * @param options - Hook configuration options
 * @returns Modules data, loading state, and CRUD functions
 *
 * @example
 * ```typescript
 * const {
 *   modules,
 *   pagination,
 *   loading,
 *   error,
 *   setSearch,
 *   setPage,
 *   createModule,
 *   deleteModule
 * } = useModules({
 *   initialParams: {
 *     page: 1,
 *     limit: 20,
 *     sortBy: 'created_at',
 *     sortOrder: 'desc'
 *   }
 * });
 *
 * // Use in component
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     {modules.map(module => (
 *       <ModuleCard key={module.id} module={module} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useModules(options: UseModulesOptions = {}): UseModulesReturn {
  const {
    enabled = true,
    initialParams = {},
    refetchInterval,
  } = options;

  // State
  const [modules, setModules] = useState<Module[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParamsState] = useState<ModuleQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialParams,
  });

  /**
   * Fetch modules from API
   */
  const fetchModules = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('[useModules] Fetching modules with params:', params);
      const response: ModuleListResponse = await getAllModules(params);

      setModules(response.modules);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });

      console.log('[useModules] ✅ Fetched', response.modules.length, 'modules');
      console.log('[useModules] Pagination:', response.totalPages, 'pages,', response.total, 'total');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch modules');
      console.error('[useModules] ❌ Error:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [enabled, params]);

  /**
   * Update query parameters (resets to page 1)
   */
  const setParams = useCallback((newParams: Partial<ModuleQueryParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to page 1 when filters change
    }));
  }, []);

  /**
   * Update search query
   */
  const setSearch = useCallback((search: string) => {
    setParams({ search });
  }, [setParams]);

  /**
   * Go to specific page
   */
  const setPage = useCallback((page: number) => {
    setParamsState((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Update items per page
   */
  const setLimit = useCallback((limit: number) => {
    setParamsState((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to page 1 when limit changes
    }));
  }, []);

  /**
   * Create new module with file upload
   */
  const handleCreateModule = useCallback(
    async (data: CreateModuleDto, file: File): Promise<Module> => {
      console.log('[useModules] Creating module:', data.title);
      const newModule = await createModule(data, file);
      console.log('[useModules] ✅ Module created:', newModule.id);
      await fetchModules(); // Refetch to update list
      return newModule;
    },
    [fetchModules]
  );

  /**
   * Update existing module
   */
  const handleUpdateModule = useCallback(
    async (id: string, data: UpdateModuleDto): Promise<Module> => {
      console.log('[useModules] Updating module:', id);
      const updatedModule = await updateModule(id, data);
      console.log('[useModules] ✅ Module updated');
      await fetchModules(); // Refetch to update list
      return updatedModule;
    },
    [fetchModules]
  );

  /**
   * Delete module (soft delete)
   */
  const handleDeleteModule = useCallback(
    async (id: string): Promise<void> => {
      console.log('[useModules] Deleting module:', id);
      await deleteModule(id);
      console.log('[useModules] ✅ Module deleted');
      await fetchModules(); // Refetch to update list
    },
    [fetchModules]
  );

  /**
   * Upload/replace file for existing module
   */
  const handleUploadFile = useCallback(
    async (id: string, file: File): Promise<Module> => {
      console.log('[useModules] Uploading file for module:', id);
      const updatedModule = await uploadModuleFile(id, file);
      console.log('[useModules] ✅ File uploaded');
      await fetchModules(); // Refetch to update list
      return updatedModule;
    },
    [fetchModules]
  );

  /**
   * Assign module to sections
   */
  const handleAssignToSections = useCallback(
    async (id: string, sectionIds: string[]): Promise<void> => {
      console.log('[useModules] Assigning module to', sectionIds.length, 'sections');
      await assignModuleToSections(id, sectionIds);
      console.log('[useModules] ✅ Module assigned to sections');
      await fetchModules(); // Refetch to update list
    },
    [fetchModules]
  );

  // Initial fetch
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    const intervalId = setInterval(() => {
      console.log('[useModules] 🔄 Auto-refreshing modules...');
      fetchModules();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchModules]);

  return {
    // Data
    modules,
    pagination,
    loading,
    error,

    // Filters & Pagination
    params,
    setParams,
    setSearch,
    setPage,
    setLimit,

    // CRUD Operations
    refetch: fetchModules,
    createModule: handleCreateModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    uploadFile: handleUploadFile,
    assignToSections: handleAssignToSections,
  };
}
