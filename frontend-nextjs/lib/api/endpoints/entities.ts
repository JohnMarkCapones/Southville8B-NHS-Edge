/**
 * Entity Counts API Endpoints
 *
 * Provides typed API functions for fetching counts of various entities
 * (subjects/departments, clubs, sections, modules, events)
 *
 * @module lib/api/endpoints/entities
 */

'use client';

import { apiClient } from '../client';

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Count response structure
 */
export interface EntityCountResponse {
  total: number;
  active?: number;
  inactive?: number;
}

// ============================================================================
// DEPARTMENTS/SUBJECTS
// ============================================================================

export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  head_teacher_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

/**
 * Fetch departments with pagination
 */
export async function getDepartments(filters?: DepartmentFilters): Promise<PaginatedResponse<Department>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters?.search) params.append('search', filters.search);

  const endpoint = `/departments${params.toString() ? `?${params.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Department>>(endpoint);
}

/**
 * Get total count of departments/subjects
 */
export async function getDepartmentCount(): Promise<EntityCountResponse> {
  try {
    const response = await getDepartments({ limit: 10000, page: 1 });
    const active = response.data.filter(d => d.is_active).length;
    const inactive = response.data.filter(d => !d.is_active).length;

    return {
      total: response.pagination.total,
      active,
      inactive,
    };
  } catch (error) {
    console.error('[API] Error fetching department count:', error);
    throw error;
  }
}

// ============================================================================
// CLUBS
// ============================================================================

export interface Club {
  id: string;
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  logo_url?: string;
  banner_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all clubs
 */
export async function getClubs(): Promise<Club[]> {
  return apiClient.get<Club[]>('/clubs');
}

/**
 * Get total count of clubs
 */
export async function getClubCount(): Promise<EntityCountResponse> {
  try {
    const clubs = await getClubs();
    const active = clubs.filter(c => c.is_active).length;
    const inactive = clubs.filter(c => !c.is_active).length;

    return {
      total: clubs.length,
      active,
      inactive,
    };
  } catch (error) {
    console.error('[API] Error fetching club count:', error);
    throw error;
  }
}

// ============================================================================
// SECTIONS
// ============================================================================

export interface Section {
  id: string;
  name: string;
  grade_level: string;
  teacher_id?: string;
  capacity?: number;
  created_at: string;
  updated_at: string;
}

export interface SectionFilters {
  page?: number;
  limit?: number;
  search?: string;
  gradeLevel?: string;
  teacherId?: string;
  sortBy?: 'created_at' | 'name' | 'grade_level';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch sections with pagination
 */
export async function getSections(filters?: SectionFilters): Promise<PaginatedResponse<Section>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.gradeLevel) params.append('gradeLevel', filters.gradeLevel);
  if (filters?.teacherId) params.append('teacherId', filters.teacherId);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const endpoint = `/sections${params.toString() ? `?${params.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Section>>(endpoint);
}

/**
 * Get total count of sections
 */
export async function getSectionCount(): Promise<EntityCountResponse> {
  try {
    const response = await getSections({ limit: 10000, page: 1 });

    return {
      total: response.pagination.total,
    };
  } catch (error) {
    console.error('[API] Error fetching section count:', error);
    throw error;
  }
}

// ============================================================================
// MODULES
// ============================================================================

export interface Module {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  r2_file_key: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  is_global: boolean;
  is_deleted: boolean;
  subject_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  sectionId?: string;
  isGlobal?: boolean;
  uploadedBy?: string;
  includeDeleted?: boolean;
  sortBy?: 'created_at' | 'title' | 'file_size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch modules with pagination
 */
export async function getModules(filters?: ModuleFilters): Promise<PaginatedResponse<Module>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.subjectId) params.append('subjectId', filters.subjectId);
  if (filters?.sectionId) params.append('sectionId', filters.sectionId);
  if (filters?.isGlobal !== undefined) params.append('isGlobal', filters.isGlobal.toString());
  if (filters?.uploadedBy) params.append('uploadedBy', filters.uploadedBy);
  if (filters?.includeDeleted !== undefined) params.append('includeDeleted', filters.includeDeleted.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const endpoint = `/modules${params.toString() ? `?${params.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Module>>(endpoint);
}

/**
 * Get total count of modules
 */
export async function getModuleCount(): Promise<EntityCountResponse> {
  try {
    // Fetch without deleted modules
    const response = await getModules({
      limit: 10000,
      page: 1,
      includeDeleted: false
    });

    const globalModules = response.data.filter(m => m.is_global).length;
    const sectionModules = response.data.filter(m => !m.is_global).length;

    return {
      total: response.pagination.total,
      active: globalModules,
      inactive: sectionModules,
    };
  } catch (error) {
    console.error('[API] Error fetching module count:', error);
    throw error;
  }
}

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  slug: string;
  start_date: string;
  end_date?: string;
  location?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'students' | 'teachers' | 'admins';
  banner_image_url?: string;
  thumbnail_url?: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility?: 'public' | 'students' | 'teachers' | 'admins';
  startDate?: string;
  endDate?: string;
  organizerId?: string;
  tagId?: string;
  search?: string;
}

/**
 * Fetch events with pagination
 */
export async function getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.visibility) params.append('visibility', filters.visibility);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.organizerId) params.append('organizerId', filters.organizerId);
  if (filters?.tagId) params.append('tagId', filters.tagId);
  if (filters?.search) params.append('search', filters.search);

  const endpoint = `/events${params.toString() ? `?${params.toString()}` : ''}`;
  return apiClient.get<PaginatedResponse<Event>>(endpoint);
}

/**
 * Get total count of events
 */
export async function getEventCount(): Promise<EntityCountResponse> {
  try {
    const response = await getEvents({ limit: 10000, page: 1 });

    const published = response.data.filter(e => e.status === 'published').length;
    const upcoming = response.data.filter(e => {
      const now = new Date();
      const startDate = new Date(e.start_date);
      return e.status === 'published' && startDate > now;
    }).length;

    return {
      total: response.pagination.total,
      active: published,
      inactive: upcoming,
    };
  } catch (error) {
    console.error('[API] Error fetching event count:', error);
    throw error;
  }
}

// ============================================================================
// AGGREGATE COUNTS
// ============================================================================

/**
 * All entity counts in one structure
 */
export interface AllEntityCounts {
  departments: EntityCountResponse | null;
  clubs: EntityCountResponse | null;
  sections: EntityCountResponse | null;
  modules: EntityCountResponse | null;
  events: EntityCountResponse | null;
}

/**
 * Fetch all entity counts in parallel
 * Optimized for dashboard loading
 */
export async function getAllEntityCounts(): Promise<AllEntityCounts> {
  try {
    const [departments, clubs, sections, modules, events] = await Promise.all([
      getDepartmentCount().catch(err => {
        console.error('[API] Failed to fetch department count:', err);
        return null;
      }),
      getClubCount().catch(err => {
        console.error('[API] Failed to fetch club count:', err);
        return null;
      }),
      getSectionCount().catch(err => {
        console.error('[API] Failed to fetch section count:', err);
        return null;
      }),
      getModuleCount().catch(err => {
        console.error('[API] Failed to fetch module count:', err);
        return null;
      }),
      getEventCount().catch(err => {
        console.error('[API] Failed to fetch event count:', err);
        return null;
      }),
    ]);

    return {
      departments,
      clubs,
      sections,
      modules,
      events,
    };
  } catch (error) {
    console.error('[API] Error fetching all entity counts:', error);
    throw error;
  }
}
