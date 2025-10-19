/**
 * ========================================
 * CLUBS API ENDPOINTS
 * ========================================
 * API client functions for interacting with the Clubs backend API.
 * 
 * Base URL: http://localhost:3004/api/v1/clubs
 * 
 * All functions use the centralized apiClient for consistent
 * error handling, authentication, and request management.
 */

import { apiClient } from '../client';
import type {
  Club,
  ClubListResponse,
  ClubResponse,
  ClubQueryParams,
  CreateClubDto,
  UpdateClubDto,
  ClubForm,
  ClubFormListResponse,
  ClubFormResponse,
  ClubFormQueryParams,
  CreateClubFormDto,
  SubmitClubFormResponseDto,
  ClubFormResponse as ClubFormResponseType,
} from '../types/clubs';

// ========================================
// CLUB CRUD OPERATIONS
// ========================================

/**
 * Get all clubs with optional filtering and pagination
 */
export async function getClubs(
  params?: ClubQueryParams
): Promise<Club[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.domain_id) queryParams.append('domain_id', params.domain_id);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/clubs${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<Club[]>(endpoint, { requiresAuth: false });
  return response;
}

/**
 * Get a single club by ID
 */
export async function getClubById(id: string): Promise<ClubResponse> {
  return apiClient.get<ClubResponse>(`/clubs/${id}`, { requiresAuth: false });
}

/**
 * Create a new club (Admin/Teacher only)
 */
export async function createClub(clubData: CreateClubDto): Promise<ClubResponse> {
  return apiClient.post<ClubResponse>('/clubs', clubData, { requiresAuth: true });
}

/**
 * Update an existing club (Admin/Teacher only)
 */
export async function updateClub(
  id: string, 
  clubData: UpdateClubDto
): Promise<ClubResponse> {
  return apiClient.patch<ClubResponse>(`/clubs/${id}`, clubData, { requiresAuth: true });
}

/**
 * Delete a club (Admin only)
 */
export async function deleteClub(id: string): Promise<void> {
  return apiClient.delete(`/clubs/${id}`, { requiresAuth: true });
}

// ========================================
// CLUB FORMS & APPLICATIONS
// ========================================

/**
 * Get all club forms with optional filtering
 */
export async function getClubForms(
  params?: ClubFormQueryParams
): Promise<ClubFormListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.club_id) queryParams.append('club_id', params.club_id);
  if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

  const queryString = queryParams.toString();
  const endpoint = `/clubs/forms${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<ClubFormListResponse>(endpoint, { requiresAuth: false });
}

/**
 * Get a specific club form by ID
 */
export async function getClubFormById(id: string): Promise<ClubFormResponse> {
  return apiClient.get<ClubFormResponse>(`/clubs/forms/${id}`, { requiresAuth: false });
}

/**
 * Create a new club form (Admin/Teacher only)
 */
export async function createClubForm(formData: CreateClubFormDto): Promise<ClubFormResponse> {
  return apiClient.post<ClubFormResponse>('/clubs/forms', formData, { requiresAuth: true });
}

/**
 * Submit a club form response (Student application)
 */
export async function submitClubFormResponse(
  responseData: SubmitClubFormResponseDto
): Promise<ClubFormResponseType> {
  return apiClient.post<ClubFormResponseType>('/clubs/forms/responses', responseData, { requiresAuth: true });
}

/**
 * Get club form responses for a specific form (Admin/Teacher only)
 */
export async function getClubFormResponses(formId: string): Promise<{ data: ClubFormResponseType[] }> {
  return apiClient.get<{ data: ClubFormResponseType[] }>(`/clubs/forms/${formId}/responses`, { requiresAuth: true });
}

/**
 * Update club form response status (Admin/Teacher only)
 */
export async function updateClubFormResponseStatus(
  responseId: string,
  status: 'approved' | 'rejected'
): Promise<ClubFormResponseType> {
  return apiClient.patch<ClubFormResponseType>(
    `/clubs/forms/responses/${responseId}/status`,
    { status },
    { requiresAuth: true }
  );
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get clubs by domain (e.g., "academic", "sports", "arts")
 */
export async function getClubsByDomain(domainId: string): Promise<Club[]> {
  return getClubs({ domain_id: domainId });
}

/**
 * Search clubs by name or description
 */
export async function searchClubs(query: string): Promise<Club[]> {
  return getClubs({ search: query });
}

/**
 * Get active club forms for a specific club
 */
export async function getActiveClubForms(clubId: string): Promise<ClubFormListResponse> {
  return getClubForms({ club_id: clubId, is_active: true });
}

/**
 * Get user's club form responses
 */
export async function getUserClubFormResponses(): Promise<{ data: ClubFormResponseType[] }> {
  return apiClient.get<{ data: ClubFormResponseType[] }>('/clubs/forms/responses/my', { requiresAuth: true });
}

// ========================================
// FRONTEND HELPER FUNCTIONS
// ========================================

/**
 * Generate a URL-friendly slug from club name
 */
export function generateClubSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Find a club by slug (searches through all clubs)
 */
export async function getClubBySlug(slug: string): Promise<Club | null> {
  try {
    const response = await getClubs({ limit: 100 });
    const clubs = response.data;
    
    const matchingClub = clubs.find(club => {
      const generatedSlug = generateClubSlug(club.name);
      return generatedSlug === slug;
    });
    
    return matchingClub || null;
  } catch (error) {
    console.error('Error fetching club by slug:', error);
    return null;
  }
}

/**
 * Get clubs with enhanced display data for frontend
 */
export async function getClubsForDisplay(): Promise<Club[]> {
  try {
    const response = await getClubs({ limit: 50 });
    return response.data;
  } catch (error) {
    console.error('Error fetching clubs for display:', error);
    return [];
  }
}

/**
 * Get featured clubs (clubs with specific criteria)
 */
export async function getFeaturedClubs(): Promise<Club[]> {
  try {
    const response = await getClubs({ limit: 6 });
    // For now, return first 3 clubs as "featured"
    // Later this can be enhanced with actual featured logic
    return response.data.slice(0, 3);
  } catch (error) {
    console.error('Error fetching featured clubs:', error);
    return [];
  }
}
