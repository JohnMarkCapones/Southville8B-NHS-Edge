/**
 * Learning Materials API Endpoints
 *
 * Provides typed API functions for teacher files management.
 * Includes functions for folder management, file operations, and analytics.
 *
 * @module lib/api/endpoints/learning-materials
 */

'use client';

import { apiClient } from '../client';

/**
 * Learning Material Folder entity from backend
 */
export interface LearningMaterialFolder {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  subject_id?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  children?: LearningMaterialFolder[];
  file_count?: number;
  subject?: {
    id: string;
    name: string;
  };
}

/**
 * Learning Material File entity from backend
 */
export interface LearningMaterialFile {
  id: string;
  folder_id: string;
  title: string;
  description?: string;
  file_url: string;
  r2_file_key: string;
  file_size_bytes: number;
  mime_type: string;
  original_filename: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  uploaded_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  folder?: {
    id: string;
    name: string;
    parent_id?: string;
  };
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
  download_count?: number;
}

/**
 * Query parameters for fetching folders
 */
export interface FolderQueryParams {
  includeDeleted?: boolean;
}

/**
 * Query parameters for fetching files
 */
export interface FileQueryParams {
  folderId?: string;
  search?: string;
  mimeType?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated files response
 */
export interface FileListResponse {
  files: LearningMaterialFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO for creating new folder
 */
export interface CreateFolderDto {
  name: string;
  description?: string;
  parent_id?: string;
  subject_id?: string;
}

/**
 * DTO for updating folder
 */
export interface UpdateFolderDto {
  name?: string;
  description?: string;
  subject_id?: string;
}

/**
 * DTO for updating file
 */
export interface UpdateFileDto {
  title?: string;
  description?: string;
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  url: string;
  expiresAt: string;
}

// ========================================
// FOLDER API FUNCTIONS
// ========================================

/**
 * Get all folders (hierarchical tree)
 *
 * @param params - Query parameters
 * @returns Promise with folder tree
 */
export async function getFolders(
  params?: FolderQueryParams
): Promise<LearningMaterialFolder[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.includeDeleted !== undefined) {
    queryParams.append('includeDeleted', String(params.includeDeleted));
  }

  const endpoint = `/teacher-files/folders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiClient.get<LearningMaterialFolder[]>(endpoint);
}

/**
 * Get folder by ID with files
 *
 * @param id - Folder UUID
 * @returns Promise with folder details
 */
export async function getFolderById(id: string): Promise<LearningMaterialFolder> {
  return apiClient.get<LearningMaterialFolder>(`/teacher-files/folders/${id}`);
}

/**
 * Create new folder
 *
 * @param data - Folder data
 * @returns Promise with created folder
 */
export async function createFolder(data: CreateFolderDto): Promise<LearningMaterialFolder> {
  return apiClient.post<LearningMaterialFolder>('/teacher-files/folders', data);
}

/**
 * Update folder
 *
 * @param id - Folder UUID
 * @param data - Updated folder data
 * @returns Promise with updated folder
 */
export async function updateFolder(
  id: string,
  data: UpdateFolderDto
): Promise<LearningMaterialFolder> {
  return apiClient.put<LearningMaterialFolder>(`/teacher-files/folders/${id}`, data);
}

/**
 * Delete folder (soft delete)
 *
 * @param id - Folder UUID
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteFolder(id: string): Promise<void> {
  return apiClient.delete<void>(`/teacher-files/folders/${id}`);
}

/**
 * Restore deleted folder
 *
 * @param id - Folder UUID
 * @returns Promise with restored folder
 */
export async function restoreFolder(id: string): Promise<LearningMaterialFolder> {
  return apiClient.post<LearningMaterialFolder>(`/teacher-files/folders/${id}/restore`);
}

// ========================================
// FILE API FUNCTIONS
// ========================================

/**
 * Get files with filtering and pagination
 *
 * @param params - Query parameters
 * @returns Promise with paginated files
 */
export async function getFiles(
  params?: FileQueryParams
): Promise<FileListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.folderId) queryParams.append('folderId', params.folderId);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.mimeType) queryParams.append('mimeType', params.mimeType);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const endpoint = `/teacher-files/files${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiClient.get<FileListResponse>(endpoint);
}

/**
 * Get file by ID
 *
 * @param id - File UUID
 * @returns Promise with file details
 */
export async function getFileById(id: string): Promise<LearningMaterialFile> {
  return apiClient.get<LearningMaterialFile>(`/teacher-files/files/${id}`);
}

/**
 * Upload new file
 *
 * @param folderId - Target folder ID
 * @param file - File to upload
 * @param metadata - File metadata
 * @returns Promise with uploaded file
 */
export async function uploadFile(
  folderId: string,
  file: File,
  metadata: { title: string; description?: string }
): Promise<LearningMaterialFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folderId', folderId);
  formData.append('title', metadata.title);
  if (metadata.description) {
    formData.append('description', metadata.description);
  }

  return apiClient.post<LearningMaterialFile>('/teacher-files/files', formData);
}

/**
 * Update file metadata
 *
 * @param id - File UUID
 * @param data - Updated file data
 * @returns Promise with updated file
 */
export async function updateFile(
  id: string,
  data: UpdateFileDto
): Promise<LearningMaterialFile> {
  return apiClient.put<LearningMaterialFile>(`/teacher-files/files/${id}`, data);
}

/**
 * Replace file content
 *
 * @param id - File UUID
 * @param file - New file
 * @returns Promise with updated file
 */
export async function replaceFile(
  id: string,
  file: File
): Promise<LearningMaterialFile> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<LearningMaterialFile>(`/teacher-files/files/${id}/replace`, formData);
}

/**
 * Delete file (soft delete)
 *
 * @param id - File UUID
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteFile(id: string): Promise<void> {
  return apiClient.delete<void>(`/teacher-files/files/${id}`);
}

/**
 * Restore deleted file
 *
 * @param id - File UUID
 * @returns Promise with restored file
 */
export async function restoreFile(id: string): Promise<LearningMaterialFile> {
  return apiClient.post<LearningMaterialFile>(`/teacher-files/files/${id}/restore`);
}

/**
 * Generate presigned download URL
 *
 * @param id - File UUID
 * @returns Promise with presigned URL (valid for 1 hour)
 */
export async function getFileDownloadUrl(id: string): Promise<DownloadUrlResponse> {
  return apiClient.get<DownloadUrlResponse>(`/teacher-files/files/${id}/download-url`);
}

// ========================================
// ANALYTICS API FUNCTIONS
// ========================================

/**
 * Get download analytics overview
 *
 * @returns Promise with analytics data
 */
export async function getAnalyticsOverview(): Promise<{
  totalFiles: number;
  totalDownloads: number;
  popularFiles: LearningMaterialFile[];
  recentActivity: any[];
}> {
  return apiClient.get('/teacher-files/analytics/overview');
}

/**
 * Get popular files
 *
 * @param limit - Number of files to return
 * @returns Promise with popular files
 */
export async function getPopularFiles(limit: number = 10): Promise<LearningMaterialFile[]> {
  return apiClient.get<LearningMaterialFile[]>(`/teacher-files/analytics/popular?limit=${limit}`);
}
