/**
 * Modules API Endpoints
 *
 * Provides typed API functions for educational modules management.
 * Includes functions for CRUD operations, file uploads, and section assignments.
 *
 * @module lib/api/endpoints/modules
 */

'use client';

import { apiClient } from '../client';

/**
 * Module entity from backend
 */
export interface Module {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  uploaded_by?: string;
  r2_file_key?: string;
  file_size_bytes?: number;
  mime_type?: string;
  is_global: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  subject_id?: string;
  created_at: string;
  updated_at: string;

  // Populated relations
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
  subject?: {
    id: string;
    subject_name: string;
    description?: string;
  };
  sections?: Array<{
    id: string;
    name: string;
    grade_level?: string;
  }>;
  downloadStats?: {
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    lastDownloaded?: string;
  };
}

/**
 * Query parameters for fetching modules
 */
export interface ModuleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  sectionId?: string;
  isGlobal?: boolean;
  uploadedBy?: string;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated modules response
 */
export interface ModuleListResponse {
  modules: Module[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO for creating new module
 */
export interface CreateModuleDto {
  title: string;
  description?: string;
  isGlobal?: boolean;
  subjectId?: string;
  sectionIds?: string[];
}

/**
 * DTO for updating module
 */
export interface UpdateModuleDto {
  title?: string;
  description?: string;
  isGlobal?: boolean;
  subjectId?: string;
  sectionIds?: string[];
  replaceFile?: boolean;
}

/**
 * DTO for assigning module to sections
 */
export interface AssignModuleDto {
  sectionIds: string[];
  visible?: boolean;
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  downloadUrl?: string; // For PDFs
  slideUrls?: string[]; // For PPTX files
  fileType: 'pdf' | 'pptx';
  expiresAt: string;
}

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Get all modules (Admin & Teacher access)
 * Uses the /admin endpoint for unrestricted access to all modules
 *
 * @param params - Query parameters for filtering/pagination
 * @returns Promise with paginated modules
 *
 * @example
 * ```typescript
 * const response = await getAllModules({
 *   page: 1,
 *   limit: 20,
 *   search: 'math',
 *   isGlobal: true
 * });
 * ```
 */
export async function getAllModules(
  params?: ModuleQueryParams
): Promise<ModuleListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
  if (params?.sectionId) queryParams.append('sectionId', params.sectionId);
  if (params?.isGlobal !== undefined) queryParams.append('isGlobal', String(params.isGlobal));
  if (params?.uploadedBy) queryParams.append('uploadedBy', params.uploadedBy);
  if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', String(params.includeDeleted));
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const endpoint = `/modules/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return apiClient.get<ModuleListResponse>(endpoint);
}

/**
 * Get accessible modules (role-based filtering)
 * Teachers see their own + global modules
 * Students see modules assigned to their sections
 *
 * @param params - Query parameters
 * @returns Promise with paginated modules
 *
 * @example
 * ```typescript
 * const response = await getModules({ page: 1, limit: 10 });
 * ```
 */
export async function getModules(
  params?: ModuleQueryParams
): Promise<ModuleListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
  if (params?.sectionId) queryParams.append('sectionId', params.sectionId);
  if (params?.isGlobal !== undefined) queryParams.append('isGlobal', String(params.isGlobal));
  if (params?.uploadedBy) queryParams.append('uploadedBy', params.uploadedBy);
  if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', String(params.includeDeleted));
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const endpoint = `/modules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return apiClient.get<ModuleListResponse>(endpoint);
}

/**
 * Get single module by ID
 *
 * @param id - Module UUID
 * @returns Promise with module details
 *
 * @example
 * ```typescript
 * const module = await getModuleById('123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export async function getModuleById(id: string): Promise<Module> {
  return apiClient.get<Module>(`/modules/${id}`);
}

/**
 * Create new module with file upload
 *
 * @param moduleData - Module metadata
 * @param file - File to upload
 * @returns Promise with created module
 *
 * @example
 * ```typescript
 * const module = await createModule(
 *   {
 *     title: 'Introduction to Biology',
 *     description: 'Chapter 1 notes',
 *     isGlobal: false,
 *     sectionIds: ['section-uuid-1', 'section-uuid-2']
 *   },
 *   fileObject
 * );
 * ```
 */
export async function createModule(
  moduleData: CreateModuleDto,
  file: File
): Promise<Module> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', moduleData.title);

  if (moduleData.description) {
    formData.append('description', moduleData.description);
  }
  if (moduleData.isGlobal !== undefined) {
    formData.append('isGlobal', String(moduleData.isGlobal));
  }
  if (moduleData.subjectId) {
    formData.append('subjectId', moduleData.subjectId);
  }
  if (moduleData.sectionIds && moduleData.sectionIds.length > 0) {
    formData.append('sectionIds', JSON.stringify(moduleData.sectionIds));
  }

  return apiClient.post<Module>('/modules', formData);
}

/**
 * Update module metadata
 *
 * @param id - Module UUID
 * @param moduleData - Updated module data
 * @returns Promise with updated module
 *
 * @example
 * ```typescript
 * const updated = await updateModule('module-id', {
 *   title: 'Updated Title',
 *   description: 'New description'
 * });
 * ```
 */
export async function updateModule(
  id: string,
  moduleData: UpdateModuleDto
): Promise<Module> {
  return apiClient.put<Module>(`/modules/${id}`, moduleData);
}

/**
 * Upload/replace file for existing module
 *
 * @param id - Module UUID
 * @param file - New file to upload
 * @returns Promise with updated module
 *
 * @example
 * ```typescript
 * const updated = await uploadModuleFile('module-id', newFileObject);
 * ```
 */
export async function uploadModuleFile(
  id: string,
  file: File
): Promise<Module> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<Module>(`/modules/${id}/upload`, formData);
}

/**
 * Soft delete module
 *
 * @param id - Module UUID
 * @returns Promise that resolves when deletion is complete
 *
 * @example
 * ```typescript
 * await deleteModule('module-id');
 * ```
 */
export async function deleteModule(id: string): Promise<void> {
  return apiClient.delete<void>(`/modules/${id}`);
}

/**
 * Generate presigned download URL
 *
 * @param id - Module UUID
 * @returns Promise with presigned URL (valid for 1 hour)
 *
 * @example
 * ```typescript
 * const { downloadUrl } = await getModuleDownloadUrl('module-id');
 * window.open(downloadUrl, '_blank');
 * ```
 */
export async function getModuleDownloadUrl(id: string): Promise<DownloadUrlResponse> {
  return apiClient.post<DownloadUrlResponse>(`/modules/${id}/download`);
}

/**
 * Assign module to sections
 *
 * @param id - Module UUID
 * @param sectionIds - Array of section UUIDs
 * @param visible - Visibility flag (default: true)
 * @returns Promise that resolves when assignment is complete
 *
 * @example
 * ```typescript
 * await assignModuleToSections('module-id', [
 *   'section-uuid-1',
 *   'section-uuid-2'
 * ], true);
 * ```
 */
export async function assignModuleToSections(
  id: string,
  sectionIds: string[],
  visible: boolean = true
): Promise<void> {
  return apiClient.post<void>(`/modules/${id}/assign`, {
    sectionIds,
    visible,
  });
}

/**
 * Update module visibility for specific section
 *
 * @param moduleId - Module UUID
 * @param sectionId - Section UUID
 * @param visible - Visibility flag
 * @returns Promise that resolves when update is complete
 *
 * @example
 * ```typescript
 * await updateModuleSectionVisibility('module-id', 'section-id', false);
 * ```
 */
export async function updateModuleSectionVisibility(
  moduleId: string,
  sectionId: string,
  visible: boolean
): Promise<void> {
  return apiClient.put<void>(`/modules/${moduleId}/sections/${sectionId}`, {
    visible,
  });
}
