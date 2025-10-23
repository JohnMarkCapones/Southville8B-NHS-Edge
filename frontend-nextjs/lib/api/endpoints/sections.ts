import { apiClient } from '../client';

export interface Section {
  id: string;
  name: string;
  grade_level: string;
  teacher_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface SectionWithDetails extends Section {
  // Teacher details
  teacher_full_name?: string;
  teacher_email?: string;
  
  // Building details
  building_name?: string;
  building_code?: string;
  
  // Floor details
  floor_name?: string;
  floor_number?: number;
  
  // Room details
  room_number?: string;
  room_name?: string;
  room_capacity?: number;
}

export interface SectionWithStudents extends SectionWithDetails {
  students?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    email?: string;
    grade_level?: string;
  }>;
}

export interface CreateSectionRequest {
  name: string;
  grade_level: string;
  teacher_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface UpdateSectionRequest {
  name?: string;
  grade_level?: string;
  teacher_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  status?: 'active' | 'inactive' | 'archived';
}

export interface SectionsListParams {
  page?: number;
  limit?: number;
  grade_level?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSectionsResponse {
  data: SectionWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AvailableTeacher {
  id: string;
  full_name: string;
  email: string;
}

// API Functions
export const getSections = async (params?: SectionsListParams): Promise<PaginatedSectionsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.grade_level) queryParams.append('grade_level', params.grade_level);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.request(`/sections?${queryParams.toString()}`, {
    method: 'GET',
    requiresAuth: true,
  });

  return response.data;
};

export const getSectionById = async (id: string): Promise<SectionWithDetails> => {
  const response = await apiClient.request(`/sections/${id}`, {
    method: 'GET',
    requiresAuth: true,
  });

  return response.data;
};

export const getSectionsByGradeLevel = async (gradeLevel: string): Promise<SectionWithDetails[]> => {
  const response = await apiClient.request(`/sections/grade/${gradeLevel}`, {
    method: 'GET',
    requiresAuth: true,
  });

  return response.data;
};

export const getAvailableTeachers = async (): Promise<AvailableTeacher[]> => {
  const response = await apiClient.request('/sections/teachers/available', {
    method: 'GET',
    requiresAuth: true,
  });

  return response.data;
};

export const createSection = async (data: CreateSectionRequest): Promise<Section> => {
  const response = await apiClient.request('/sections', {
    method: 'POST',
    body: data,
    requiresAuth: true,
  });

  return response.data;
};

export const updateSection = async (id: string, data: UpdateSectionRequest): Promise<Section> => {
  const response = await apiClient.request(`/sections/${id}`, {
    method: 'PATCH',
    body: data,
    requiresAuth: true,
  });

  return response.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await apiClient.request(`/sections/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
};

export const getTeacherSections = async (teacherUserId: string): Promise<SectionWithDetails[]> => {
  const response = await apiClient.request(`/sections/teacher/${teacherUserId}`, {
    method: 'GET',
    requiresAuth: true,
  });

  return response.data;
};