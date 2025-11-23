/**
 * Custom hook for departments management
 *
 * Provides state management and API operations for departments.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Department,
  DepartmentsListParams,
  getDepartments,
  getDepartment,
  getActiveDepartments,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  activateDepartment,
  deactivateDepartment,
  assignDepartmentHead,
  getDepartmentCounts,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@/lib/api/endpoints/departments';

interface UseDepartmentsState {
  departments: Department[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UseDepartmentsReturn extends UseDepartmentsState {
  // Data operations
  loadDepartments: (params?: DepartmentsListParams) => Promise<void>;
  loadDepartment: (id: string) => Promise<Department | null>;
  loadActiveDepartments: () => Promise<void>;
  loadAllDepartments: () => Promise<void>;
  addDepartment: (data: CreateDepartmentRequest) => Promise<Department | null>;
  updateDepartmentData: (id: string, data: UpdateDepartmentRequest) => Promise<Department | null>;
  removeDepartment: (id: string) => Promise<boolean>;
  activateDept: (id: string) => Promise<Department | null>;
  deactivateDept: (id: string) => Promise<Department | null>;
  assignHead: (id: string, teacherId: string) => Promise<Department | null>;
  getCounts: () => Promise<any>;

  // Utility operations
  refreshDepartments: () => Promise<void>;

  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDepartments = (initialParams?: DepartmentsListParams): UseDepartmentsReturn => {
  const [state, setState] = useState<UseDepartmentsState>({
    departments: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const [params, setParams] = useState<DepartmentsListParams | undefined>(initialParams);

  // Load departments with pagination and filtering
  const loadDepartments = useCallback(async (newParams?: DepartmentsListParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const searchParams = { ...params, ...newParams };
      setParams(searchParams);

      const response = await getDepartments(searchParams);

      setState(prev => ({
        ...prev,
        departments: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load departments',
      }));
    }
  }, [params]);

  // Load a single department
  const loadDepartment = useCallback(async (id: string): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const department = await getDepartment(id);

      setState(prev => ({
        ...prev,
        loading: false,
      }));

      return department;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load department',
      }));
      return null;
    }
  }, []);

  // Load only active departments
  const loadActiveDepartments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const departments = await getActiveDepartments();

      setState(prev => ({
        ...prev,
        departments,
        loading: false,
        pagination: null, // No pagination for this operation
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load active departments',
      }));
    }
  }, []);

  // Load all departments (no pagination)
  const loadAllDepartments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const departments = await getAllDepartments();

      setState(prev => ({
        ...prev,
        departments,
        loading: false,
        pagination: null, // No pagination for this operation
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load all departments',
      }));
    }
  }, []);

  // Add a new department
  const addDepartment = useCallback(async (data: CreateDepartmentRequest): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const newDepartment = await createDepartment(data);

      setState(prev => ({
        ...prev,
        departments: [newDepartment, ...prev.departments],
        loading: false,
      }));

      return newDepartment;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to create department',
      }));
      return null;
    }
  }, []);

  // Update an existing department
  const updateDepartmentData = useCallback(async (id: string, data: UpdateDepartmentRequest): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedDepartment = await updateDepartment(id, data);

      setState(prev => ({
        ...prev,
        departments: prev.departments.map(dept =>
          dept.id === id ? updatedDepartment : dept
        ),
        loading: false,
      }));

      return updatedDepartment;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to update department',
      }));
      return null;
    }
  }, []);

  // Delete a department
  const removeDepartment = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await deleteDepartment(id);

      setState(prev => ({
        ...prev,
        departments: prev.departments.filter(dept => dept.id !== id),
        loading: false,
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to delete department',
      }));
      return false;
    }
  }, []);

  // Activate a department
  const activateDept = useCallback(async (id: string): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const activatedDept = await activateDepartment(id);

      setState(prev => ({
        ...prev,
        departments: prev.departments.map(dept =>
          dept.id === id ? activatedDept : dept
        ),
        loading: false,
      }));

      return activatedDept;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to activate department',
      }));
      return null;
    }
  }, []);

  // Deactivate a department
  const deactivateDept = useCallback(async (id: string): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const deactivatedDept = await deactivateDepartment(id);

      setState(prev => ({
        ...prev,
        departments: prev.departments.map(dept =>
          dept.id === id ? deactivatedDept : dept
        ),
        loading: false,
      }));

      return deactivatedDept;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to deactivate department',
      }));
      return null;
    }
  }, []);

  // Assign department head
  const assignHead = useCallback(async (id: string, teacherId: string): Promise<Department | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedDept = await assignDepartmentHead(id, teacherId);

      setState(prev => ({
        ...prev,
        departments: prev.departments.map(dept =>
          dept.id === id ? updatedDept : dept
        ),
        loading: false,
      }));

      return updatedDept;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to assign department head',
      }));
      return null;
    }
  }, []);

  // Get department counts
  const getCounts = useCallback(async () => {
    try {
      return await getDepartmentCounts();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error?.message || 'Failed to load department counts',
      }));
      return null;
    }
  }, []);

  // Refresh departments list
  const refreshDepartments = useCallback(async () => {
    await loadDepartments(params);
  }, [loadDepartments, params]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Load departments on mount if initial params provided
  useEffect(() => {
    if (initialParams) {
      loadDepartments(initialParams);
    }
  }, []); // Only run on mount

  return {
    ...state,
    loadDepartments,
    loadDepartment,
    loadActiveDepartments,
    loadAllDepartments,
    addDepartment,
    updateDepartmentData,
    removeDepartment,
    activateDept,
    deactivateDept,
    assignHead,
    getCounts,
    refreshDepartments,
    clearError,
    setLoading,
  };
};
