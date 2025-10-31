/**
 * Departments API Endpoints
 *
 * API client functions for department management operations.
 */

import { apiClient } from '../client';

// ========================================
// TYPES
// ========================================

export interface Department {
  id: string;
  department_name: string;
  description?: string;
  head_id?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  head?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface DepartmentsListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentsListParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  description?: string;
  headId?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentRequest {
  departmentName?: string;
  description?: string;
  headId?: string;
  isActive?: boolean;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Get all departments with pagination and filtering
 */
export const getDepartments = async (params?: DepartmentsListParams): Promise<DepartmentsListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
  if (params?.search) searchParams.append('search', params.search);

  const queryString = searchParams.toString();
  const url = queryString ? `/departments?${queryString}` : '/departments';

  return apiClient.get<DepartmentsListResponse>(url);
};

/**
 * Get a single department by ID
 */
export const getDepartment = async (id: string): Promise<Department> => {
  return apiClient.get<Department>(`/departments/${id}`);
};

/**
 * Create a new department
 */
export const createDepartment = async (data: CreateDepartmentRequest): Promise<Department> => {
  return apiClient.post<Department>('/departments', data);
};

/**
 * Update an existing department
 */
export const updateDepartment = async (id: string, data: UpdateDepartmentRequest): Promise<Department> => {
  return apiClient.patch<Department>(`/departments/${id}`, data);
};

/**
 * Delete a department
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/departments/${id}`);
};

/**
 * Activate a department
 */
export const activateDepartment = async (id: string): Promise<Department> => {
  return apiClient.post<Department>(`/departments/${id}/activate`, {});
};

/**
 * Deactivate a department
 */
export const deactivateDepartment = async (id: string): Promise<Department> => {
  return apiClient.post<Department>(`/departments/${id}/deactivate`, {});
};

/**
 * Assign department head
 */
export const assignDepartmentHead = async (id: string, teacherId: string): Promise<Department> => {
  return apiClient.post<Department>(`/departments/${id}/assign-head`, { teacherId });
};

/**
 * Get department counts
 */
export const getDepartmentCounts = async (): Promise<{
  pagination: { total: number };
  active: number;
  inactive: number;
}> => {
  return apiClient.get('/departments/count');
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get active departments only
 */
export const getActiveDepartments = async (): Promise<Department[]> => {
  const response = await getDepartments({ isActive: true, limit: 1000 });
  return response.data;
};

/**
 * Get all departments (no pagination)
 */
export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await getDepartments({ limit: 1000 });
  return response.data;
};

/**
 * Search departments by name
 */
export const searchDepartments = async (query: string): Promise<Department[]> => {
  const response = await getDepartments({ search: query, limit: 50 });
  return response.data;
};
