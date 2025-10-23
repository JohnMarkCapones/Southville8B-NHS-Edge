/**
 * Superadmin Resources API Client
 *
 * API client functions for managing system-wide resources (folders and files).
 * Provides full CRUD operations, analytics, and advanced features for superadmin.
 *
 * @module lib/api/endpoints/superadmin-resources
 */

import { apiClient } from '../client';

/**
 * Superadmin Folder entity from backend
 */
export interface SuperadminFolder {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  children?: SuperadminFolder[];
  file_count?: number;
}

/**
 * Superadmin File entity from backend
 */
export interface SuperadminFile {
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
  visibility?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated files response
 */
export interface FileListResponse {
  files: SuperadminFile[];
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
}

/**
 * DTO for updating folder
 */
export interface UpdateFolderDto {
  name?: string;
  description?: string;
  parent_id?: string;
}

/**
 * DTO for uploading file
 */
export interface UploadFileDto {
  folder_id: string;
  title: string;
  description?: string;
  visibility?: string;
  tags?: string[];
}

/**
 * DTO for updating file
 */
export interface UpdateFileDto {
  title?: string;
  description?: string;
  folder_id?: string;
  visibility?: string;
  tags?: string[];
}

/**
 * Analytics overview data
 */
export interface AnalyticsOverview {
  totalFiles: number;
  totalFolders: number;
  totalDownloads: number;
  totalStorage: number;
  storageUsed: number;
  storageLimit: number;
  popularFiles: SuperadminFile[];
  recentUploads: SuperadminFile[];
  downloadStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  url: string;
  expiresAt: string;
}

// ==================== FOLDER ENDPOINTS ====================

/**
 * Get all folders (hierarchical tree)
 *
 * @param params - Query parameters
 * @returns Promise with folder tree
 */
export async function getFolders(params?: FolderQueryParams): Promise<SuperadminFolder[]> {
  return apiClient.get<SuperadminFolder[]>('/teacher-files/folders', { params });
}

/**
 * Get folder by ID with file count
 *
 * @param id - Folder UUID
 * @returns Promise with folder details
 */
export async function getFolderById(id: string): Promise<SuperadminFolder> {
  return apiClient.get<SuperadminFolder>(`/teacher-files/folders/${id}`);
}

/**
 * Create new folder
 *
 * @param data - Folder data
 * @returns Promise with created folder
 */
export async function createFolder(data: CreateFolderDto): Promise<SuperadminFolder> {
  return apiClient.post<SuperadminFolder>('/teacher-files/folders', data);
}

/**
 * Update folder
 *
 * @param id - Folder UUID
 * @param data - Updated folder data
 * @returns Promise with updated folder
 */
export async function updateFolder(id: string, data: UpdateFolderDto): Promise<SuperadminFolder> {
  return apiClient.put<SuperadminFolder>(`/teacher-files/folders/${id}`, data);
}

/**
 * Delete folder (soft delete)
 *
 * @param id - Folder UUID
 * @returns Promise with success message
 */
export async function deleteFolder(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/teacher-files/folders/${id}`);
}

/**
 * Restore deleted folder
 *
 * @param id - Folder UUID
 * @returns Promise with restored folder
 */
export async function restoreFolder(id: string): Promise<SuperadminFolder> {
  return apiClient.post<SuperadminFolder>(`/teacher-files/folders/${id}/restore`);
}

/**
 * Move folder to different parent
 *
 * @param id - Folder UUID
 * @param parentId - New parent folder ID
 * @returns Promise with updated folder
 */
export async function moveFolder(id: string, parentId: string): Promise<SuperadminFolder> {
  return apiClient.put<SuperadminFolder>(`/teacher-files/folders/${id}/move`, { parent_id: parentId });
}

// ==================== FILE ENDPOINTS ====================

/**
 * Get files with filtering and pagination
 *
 * @param params - Query parameters
 * @returns Promise with paginated file list
 */
export async function getFiles(params?: FileQueryParams): Promise<FileListResponse> {
  return apiClient.get<FileListResponse>('/teacher-files/files', { params });
}

/**
 * Get file by ID
 *
 * @param id - File UUID
 * @returns Promise with file details
 */
export async function getFileById(id: string): Promise<SuperadminFile> {
  return apiClient.get<SuperadminFile>(`/teacher-files/files/${id}`);
}

/**
 * Upload file
 *
 * @param file - File to upload
 * @param data - File metadata
 * @returns Promise with created file
 */
export async function uploadFile(file: File, data: UploadFileDto): Promise<SuperadminFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder_id', data.folder_id);
  formData.append('title', data.title);
  
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.visibility) {
    formData.append('visibility', data.visibility);
  }
  if (data.tags && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }

  return apiClient.post<SuperadminFile>('/teacher-files/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Update file metadata
 *
 * @param id - File UUID
 * @param data - Updated file data
 * @returns Promise with updated file
 */
export async function updateFile(id: string, data: UpdateFileDto): Promise<SuperadminFile> {
  return apiClient.put<SuperadminFile>(`/teacher-files/files/${id}`, data);
}

/**
 * Replace file content
 *
 * @param id - File UUID
 * @param file - New file content
 * @returns Promise with updated file
 */
export async function replaceFile(id: string, file: File): Promise<SuperadminFile> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<SuperadminFile>(`/teacher-files/files/${id}/replace`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Delete file (soft delete)
 *
 * @param id - File UUID
 * @returns Promise with success message
 */
export async function deleteFile(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`/teacher-files/files/${id}`);
}

/**
 * Restore deleted file
 *
 * @param id - File UUID
 * @returns Promise with restored file
 */
export async function restoreFile(id: string): Promise<SuperadminFile> {
  return apiClient.post<SuperadminFile>(`/teacher-files/files/${id}/restore`);
}

/**
 * Get presigned download URL
 *
 * @param id - File UUID
 * @returns Promise with download URL
 */
export async function getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
  return apiClient.get<DownloadUrlResponse>(`/teacher-files/files/${id}/download-url`);
}

/**
 * Download file (triggers download and logs it)
 *
 * @param id - File UUID
 * @returns Promise with download URL for direct download
 */
export async function downloadFile(id: string): Promise<void> {
  const { url } = await getDownloadUrl(id);
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== ANALYTICS ENDPOINTS ====================

/**
 * Get analytics overview
 *
 * @returns Promise with analytics data
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiClient.get<AnalyticsOverview>('/teacher-files/analytics/overview');
}

/**
 * Get popular files
 *
 * @param limit - Number of files to return (default: 10)
 * @returns Promise with popular files
 */
export async function getPopularFiles(limit: number = 10): Promise<SuperadminFile[]> {
  return apiClient.get<SuperadminFile[]>(`/teacher-files/analytics/popular?limit=${limit}`);
}

/**
 * Get file download history
 *
 * @param id - File UUID
 * @returns Promise with download history
 */
export async function getFileDownloadHistory(id: string): Promise<any[]> {
  return apiClient.get<any[]>(`/teacher-files/files/${id}/downloads`);
}

/**
 * Get user download history
 *
 * @returns Promise with user's download history
 */
export async function getUserDownloadHistory(): Promise<any[]> {
  return apiClient.get<any[]>('/teacher-files/analytics/my-downloads');
}

// ==================== BULK OPERATIONS ====================

/**
 * Bulk delete files
 *
 * @param ids - Array of file UUIDs
 * @returns Promise with success message
 */
export async function bulkDeleteFiles(ids: string[]): Promise<{ message: string; deleted: number }> {
  return apiClient.post<{ message: string; deleted: number }>('/teacher-files/files/bulk-delete', { ids });
}

/**
 * Bulk move files to folder
 *
 * @param ids - Array of file UUIDs
 * @param folderId - Target folder ID
 * @returns Promise with success message
 */
export async function bulkMoveFiles(ids: string[], folderId: string): Promise<{ message: string; moved: number }> {
  return apiClient.post<{ message: string; moved: number }>('/teacher-files/files/bulk-move', { ids, folder_id: folderId });
}

/**
 * Bulk update file visibility
 *
 * @param ids - Array of file UUIDs
 * @param visibility - New visibility setting
 * @returns Promise with success message
 */
export async function bulkUpdateVisibility(ids: string[], visibility: string): Promise<{ message: string; updated: number }> {
  return apiClient.post<{ message: string; updated: number }>('/teacher-files/files/bulk-visibility', { ids, visibility });
}
