import { apiClient } from "../client"

export interface ClubSummary {
  id: string
  name: string
  description?: string
  category?: string
  member_count?: number
}

export interface ClubsListResponse {
  data: ClubSummary[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface StudentClubMembership {
  id: string
  studentId: string
  clubId: string
  positionId: string
  joinedAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Populated fields
  student?: any
  club?: ClubSummary
  position?: { id: string; name: string }
}

export async function getAvailableClubs(params: { page?: number; limit?: number; search?: string; category?: string } = {}): Promise<ClubsListResponse> {
  const q = new URLSearchParams()
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)
  if (params.category && params.category !== 'all') q.set('category', params.category)
  const qs = q.toString()
  return apiClient.get<ClubsListResponse>(`/clubs${qs ? `?${qs}` : ''}`)
}

export async function getStudentClubs(studentId: string): Promise<StudentClubMembership[]> {
  return apiClient.get<StudentClubMembership[]>(`/club-memberships/student/${studentId}`)
}

export async function joinClub(clubId: string): Promise<{ success: boolean }> {
  return apiClient.post<{ success: boolean }>(`/clubs/${clubId}/join`)
}

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
    const clubs = await getClubs({ limit: 100 });

    const matchingClub = clubs.find((club: Club) => {
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
    const clubs = await getClubs({ limit: 50 });
    return clubs;
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
    const clubs = await getClubs({ limit: 6 });
    // For now, return first 3 clubs as "featured"
    // Later this can be enhanced with actual featured logic
    return clubs.slice(0, 3);
  } catch (error) {
    console.error('Error fetching featured clubs:', error);
    return [];
  }
}

// ========================================
// CLUB POSITIONS
// ========================================

export interface ClubPosition {
  id: string;
  name: string;
}

/**
 * Get all available club positions
 */
export async function getClubPositions(): Promise<ClubPosition[]> {
  return apiClient.get<ClubPosition[]>('/clubs/positions', {
    requiresAuth: false,
  });
}

// ========================================
// CLUB MEMBERSHIP MUTATIONS
// ========================================

export interface CreateClubMembershipDto {
  studentId: string;
  clubId: string;
  positionId: string;
  joinedAt?: string;
  isActive?: boolean;
}

export interface UpdateClubMembershipDto {
  positionId?: string;
  isActive?: boolean;
}

/**
 * Add member to club
 */
export async function addClubMember(
  data: CreateClubMembershipDto
): Promise<any> {
  return apiClient.post<any>('/club-memberships', data, {
    requiresAuth: true,
  });
}

/**
 * Add multiple members to club (bulk add)
 */
export async function addClubMembersBulk(
  members: CreateClubMembershipDto[]
): Promise<any[]> {
  // Call API for each member
  const promises = members.map((member) => addClubMember(member));
  return Promise.all(promises);
}

/**
 * Update club membership (change position)
 */
export async function updateClubMembership(
  membershipId: string,
  data: UpdateClubMembershipDto
): Promise<any> {
  return apiClient.patch<any>(
    `/club-memberships/${membershipId}`,
    data,
    { requiresAuth: true }
  );
}

/**
 * Remove member from club
 */
export async function removeClubMember(membershipId: string): Promise<void> {
  return apiClient.delete(`/club-memberships/${membershipId}`, {
    requiresAuth: true,
  });
}

/**
 * Get all club memberships (with optional club filter)
 */
export async function getAllClubMemberships(clubId?: string): Promise<any[]> {
  const endpoint = clubId
    ? `/club-memberships?clubId=${clubId}`
    : '/club-memberships';

  return apiClient.get<any[]>(endpoint, { requiresAuth: true });
}

// ========================================
// ENHANCED FUNCTIONS FOR SUPERADMIN
// ========================================

/**
 * Get all clubs with member counts for table display
 * Fetches clubs and memberships in parallel for efficiency
 */
export async function getClubsWithMemberCounts(): Promise<{
  clubs: Club[];
  memberships: any[];
}> {
  try {
    const [clubs, memberships] = await Promise.all([
      getClubs(),
      getAllClubMemberships(),
    ]);

    return { clubs, memberships };
  } catch (error) {
    console.error('Error fetching clubs with member counts:', error);
    throw error;
  }
}

// ========================================
// CLUB ANNOUNCEMENTS
// ========================================

export interface ClubAnnouncement {
  id: string;
  club_id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateClubAnnouncementDto {
  club_id: string;
  title: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateClubAnnouncementDto {
  title?: string;
  content?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Get all announcements for a club (Public)
 */
export async function getClubAnnouncements(clubId: string): Promise<ClubAnnouncement[]> {
  return apiClient.get<ClubAnnouncement[]>(`/club-announcements/club/${clubId}`, {
    requiresAuth: false,
  });
}

/**
 * Get a single announcement by ID (Public)
 */
export async function getClubAnnouncementById(id: string): Promise<ClubAnnouncement> {
  return apiClient.get<ClubAnnouncement>(`/club-announcements/${id}`, {
    requiresAuth: false,
  });
}

/**
 * Create a new club announcement (Teachers/Admins only)
 */
export async function createClubAnnouncement(
  data: CreateClubAnnouncementDto
): Promise<ClubAnnouncement> {
  return apiClient.post<ClubAnnouncement>('/club-announcements', data, {
    requiresAuth: true,
  });
}

/**
 * Update an announcement (Creator/Teachers/Admins only)
 */
export async function updateClubAnnouncement(
  id: string,
  data: UpdateClubAnnouncementDto
): Promise<ClubAnnouncement> {
  return apiClient.patch<ClubAnnouncement>(`/club-announcements/${id}`, data, {
    requiresAuth: true,
  });
}

/**
 * Delete an announcement (Creator/Teachers/Admins only)
 */
export async function deleteClubAnnouncement(id: string): Promise<void> {
  return apiClient.delete(`/club-announcements/${id}`, {
    requiresAuth: true,
  });
}

// ========================================
// CLUB FORM RESPONSES (PENDING APPLICATIONS)
// ========================================

/**
 * Get all form responses for a specific club form
 * Used for viewing pending applications
 */
export async function getClubFormResponsesByFormId(
  clubId: string,
  formId: string
): Promise<ClubFormResponse[]> {
  return apiClient.get<ClubFormResponse[]>(
    `/clubs/${clubId}/forms/${formId}/responses`,
    { requiresAuth: true }
  );
}

/**
 * Review a form response (approve or reject)
 * Used by teachers to approve/reject student applications
 */
export async function reviewClubFormResponse(
  clubId: string,
  formId: string,
  responseId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<ClubFormResponse> {
  return apiClient.patch<ClubFormResponse>(
    `/clubs/${clubId}/forms/${formId}/responses/${responseId}/review`,
    {
      status,
      review_notes: reviewNotes,
    },
    { requiresAuth: true }
  );
}

/**
 * Approve a club application
 */
export async function approveClubApplication(
  clubId: string,
  formId: string,
  responseId: string,
  notes?: string
): Promise<ClubFormResponse> {
  return reviewClubFormResponse(clubId, formId, responseId, 'approved', notes);
}

/**
 * Reject a club application
 */
export async function rejectClubApplication(
  clubId: string,
  formId: string,
  responseId: string,
  notes?: string
): Promise<ClubFormResponse> {
  return reviewClubFormResponse(clubId, formId, responseId, 'rejected', notes);
}
