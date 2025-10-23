/**
 * Subjects API Endpoints
 * 
 * API client functions for subject management operations.
 * Handles subjects CRUD operations with proper typing and error handling.
 */

import { apiClient } from '../client';

// ========================================
// TYPES
// ========================================

export interface Subject {
  id: string;
  code: string;
  subject_name: string;
  description?: string;
  department_id?: string;
  grade_levels: string[];
  status: 'active' | 'inactive' | 'archived';
  visibility: 'public' | 'students' | 'restricted';
  color_hex?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectRequest {
  code: string;
  subject_name: string;
  description?: string;
  department_id?: string;
  grade_levels: string[];
  status?: 'active' | 'inactive' | 'archived';
  visibility?: 'public' | 'students' | 'restricted';
}

export interface UpdateSubjectRequest {
  code?: string;
  subject_name?: string;
  description?: string;
  department_id?: string;
  grade_levels?: string[];
  status?: 'active' | 'inactive' | 'archived';
  visibility?: 'public' | 'students' | 'restricted';
}

export interface SubjectsListResponse {
  data: Subject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SubjectsListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'created_at' | 'subject_name' | 'code';
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Get all subjects with pagination and filtering
 */
export const getSubjects = async (params?: SubjectsListParams): Promise<SubjectsListResponse> => {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const queryString = searchParams.toString();
  const url = queryString ? `/subjects?${queryString}` : '/subjects';
  
  return apiClient.get<SubjectsListResponse>(url);
};

/**
 * Get a single subject by ID
 */
export const getSubject = async (id: string): Promise<Subject> => {
  return apiClient.get<Subject>(`/subjects/${id}`);
};

/**
 * Create a new subject
 */
export const createSubject = async (data: CreateSubjectRequest): Promise<Subject> => {
  return apiClient.post<Subject>('/subjects', data);
};

/**
 * Update an existing subject
 */
export const updateSubject = async (id: string, data: UpdateSubjectRequest): Promise<Subject> => {
  return apiClient.patch<Subject>(`/subjects/${id}`, data);
};

/**
 * Delete a subject
 */
export const deleteSubject = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/subjects/${id}`);
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get subjects for a specific grade level
 */
export const getSubjectsByGradeLevel = async (gradeLevel: string): Promise<Subject[]> => {
  const response = await getSubjects({ limit: 1000 }); // Get all subjects
  return response.data.filter(subject => 
    subject.grade_levels.includes(gradeLevel)
  );
};

/**
 * Get active subjects only
 */
export const getActiveSubjects = async (params?: Omit<SubjectsListParams, 'status'>): Promise<SubjectsListResponse> => {
  const response = await getSubjects(params);
  return {
    ...response,
    data: response.data.filter(subject => subject.status === 'active')
  };
};

/**
 * Search subjects by name or code
 */
export const searchSubjects = async (query: string): Promise<Subject[]> => {
  const response = await getSubjects({ search: query, limit: 50 });
  return response.data;
};

/**
 * Get subjects by department
 */
export const getSubjectsByDepartment = async (departmentId: string): Promise<Subject[]> => {
  const response = await getSubjects({ limit: 1000 });
  return response.data.filter(subject => subject.department_id === departmentId);
};

/**
 * Get subjects by status
 */
export const getSubjectsByStatus = async (status: 'active' | 'inactive' | 'archived'): Promise<Subject[]> => {
  const response = await getSubjects({ limit: 1000 });
  return response.data.filter(subject => subject.status === status);
};

/**
 * Get subjects by visibility
 */
export const getSubjectsByVisibility = async (visibility: 'public' | 'students' | 'restricted'): Promise<Subject[]> => {
  const response = await getSubjects({ limit: 1000 });
  return response.data.filter(subject => subject.visibility === visibility);
};

/**
 * Check if subject code exists
 */
export const checkSubjectCodeExists = async (code: string, excludeId?: string): Promise<boolean> => {
  try {
    const response = await getSubjects({ search: code, limit: 1 });
    const existingSubject = response.data.find(subject => 
      subject.code.toLowerCase() === code.toLowerCase() && subject.id !== excludeId
    );
    return !!existingSubject;
  } catch {
    return false;
  }
};

/**
 * Get subject statistics
 */
export const getSubjectStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  archived: number;
  byGradeLevel: Record<string, number>;
  byDepartment: Record<string, number>;
  byVisibility: Record<string, number>;
}> => {
  const response = await getSubjects({ limit: 1000 });
  const subjects = response.data;

  const stats = {
    total: subjects.length,
    active: subjects.filter(s => s.status === 'active').length,
    inactive: subjects.filter(s => s.status === 'inactive').length,
    archived: subjects.filter(s => s.status === 'archived').length,
    byGradeLevel: {} as Record<string, number>,
    byDepartment: {} as Record<string, number>,
    byVisibility: {} as Record<string, number>,
  };

  // Count by grade level
  subjects.forEach(subject => {
    subject.grade_levels.forEach(level => {
      stats.byGradeLevel[level] = (stats.byGradeLevel[level] || 0) + 1;
    });
  });

  // Count by department
  subjects.forEach(subject => {
    const dept = subject.department_id || 'No Department';
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
  });

  // Count by visibility
  subjects.forEach(subject => {
    stats.byVisibility[subject.visibility] = (stats.byVisibility[subject.visibility] || 0) + 1;
  });

  return stats;
};








