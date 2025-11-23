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
 * Get all club forms for a specific club
 * Backend uses path parameters: /clubs/{clubId}/forms
 * Requires authentication (STUDENT, TEACHER, or ADMIN role)
 * Backend returns array directly, not wrapped in {data: [...]}
 */
export async function getClubForms(
  clubId: string
): Promise<ClubForm[]> {
  const endpoint = `/clubs/${clubId}/forms`;
  return apiClient.get<ClubForm[]>(endpoint, { requiresAuth: true });
}

/**
 * Get a specific club form by ID
 * Backend uses path parameters: /clubs/{clubId}/forms/{formId}
 * Requires authentication (STUDENT, TEACHER, or ADMIN role)
 * Backend returns form directly, not wrapped in {data: ...}
 */
export async function getClubFormById(clubId: string, formId: string): Promise<ClubForm> {
  return apiClient.get<ClubForm>(`/clubs/${clubId}/forms/${formId}`, { requiresAuth: true });
}

/**
 * Create a new club form (Admin/Teacher only)
 * Backend uses path parameters: /clubs/{clubId}/forms
 * Backend returns form directly
 */
export async function createClubForm(clubId: string, formData: Omit<CreateClubFormDto, 'club_id'>): Promise<ClubForm> {
  return apiClient.post<ClubForm>(`/clubs/${clubId}/forms`, formData, { requiresAuth: true });
}

/**
 * Submit a club form response (Student application)
 * Backend uses path parameters: /clubs/{clubId}/forms/{formId}/responses
 *
 * Answer types:
 * - text/textarea: use answer_text
 * - radio/select/checkbox: use answer_value
 *
 * Backend validates:
 * - All required questions must be answered
 * - No duplicate question_ids
 * - Dropdown/radio values must match options
 * - Checkbox values must be JSON array or comma-separated
 */
export async function submitClubFormResponse(
  clubId: string,
  formId: string,
  answers: { question_id: string; answer_text?: string; answer_value?: string }[]
): Promise<ClubFormResponseType> {
  return apiClient.post<ClubFormResponseType>(`/clubs/${clubId}/forms/${formId}/responses`, { answers }, { requiresAuth: true });
}

/**
 * Get club form responses for a specific form (Admin/Teacher only)
 * Backend uses path parameters: /clubs/{clubId}/forms/{formId}/responses
 * Backend returns array directly
 */
export async function getClubFormResponses(clubId: string, formId: string): Promise<ClubFormResponseType[]> {
  return apiClient.get<ClubFormResponseType[]>(`/clubs/${clubId}/forms/${formId}/responses`, { requiresAuth: true });
}

/**
 * Update club form response status (Admin/Teacher only)
 * Backend uses path parameters: /clubs/{clubId}/forms/{formId}/responses/{responseId}/review
 */
export async function updateClubFormResponseStatus(
  clubId: string,
  formId: string,
  responseId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<ClubFormResponseType> {
  return apiClient.patch<ClubFormResponseType>(
    `/clubs/${clubId}/forms/${formId}/responses/${responseId}/review`,
    { status, review_notes: reviewNotes },
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
 * Get all forms for a specific club (including active and inactive)
 * Backend returns all forms as array, frontend can filter by is_active if needed
 */
export async function getActiveClubForms(clubId: string): Promise<ClubForm[]> {
  const forms = await getClubForms(clubId);
  // Filter for active forms only
  return forms.filter(form => form.is_active);
}

/**
 * Get user's club form responses (their applications)
 * Returns array directly from backend
 * Endpoint: GET /clubs/my-applications
 */
export async function getUserClubFormResponses(): Promise<ClubFormResponseType[]> {
  return apiClient.get<ClubFormResponseType[]>('/clubs/my-applications', { requiresAuth: true });
}

/**
 * Withdraw a club application
 * Soft deletes by updating status to 'withdrawn'
 * Endpoint: PATCH /clubs/my-applications/:responseId/withdraw
 */
export async function withdrawClubApplication(responseId: string): Promise<ClubFormResponseType> {
  return apiClient.patch<ClubFormResponseType>(`/clubs/my-applications/${responseId}/withdraw`, {}, { requiresAuth: true });
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
 * (This is an alias for getClubFormResponses for backward compatibility)
 */
export async function getClubFormResponsesByFormId(
  clubId: string,
  formId: string
): Promise<ClubFormResponse[]> {
  return getClubFormResponses(clubId, formId) as unknown as ClubFormResponse[];
}

/**
 * Review a form response (approve or reject)
 * Used by teachers to approve/reject student applications
 * (This is an alias for updateClubFormResponseStatus)
 */
export async function reviewClubFormResponse(
  clubId: string,
  formId: string,
  responseId: string,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): Promise<ClubFormResponse> {
  return updateClubFormResponseStatus(clubId, formId, responseId, status, reviewNotes) as Promise<ClubFormResponse>;
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

// ========================================
// CLUB BENEFITS CRUD
// ========================================

import type { ClubBenefitData } from '../types/clubs';

export interface CreateClubBenefitDto {
  title: string;
  description: string;
  order_index: number;
}

export interface UpdateClubBenefitDto {
  title?: string;
  description?: string;
  order_index?: number;
}

/**
 * Get all benefits for a club (Public)
 */
export async function getClubBenefits(clubId: string): Promise<ClubBenefitData[]> {
  return apiClient.get<ClubBenefitData[]>(`/clubs/${clubId}/benefits`, {
    requiresAuth: false,
  });
}

/**
 * Get a single benefit by ID (Public)
 */
export async function getClubBenefitById(
  clubId: string,
  benefitId: string
): Promise<ClubBenefitData> {
  return apiClient.get<ClubBenefitData>(`/clubs/${clubId}/benefits/${benefitId}`, {
    requiresAuth: false,
  });
}

/**
 * Create a new benefit for a club (Teachers/Admins only)
 */
export async function createClubBenefit(
  clubId: string,
  data: CreateClubBenefitDto
): Promise<ClubBenefitData> {
  return apiClient.post<ClubBenefitData>(`/clubs/${clubId}/benefits`, data, {
    requiresAuth: true,
  });
}

/**
 * Update a benefit (Teachers/Admins only)
 */
export async function updateClubBenefit(
  clubId: string,
  benefitId: string,
  data: UpdateClubBenefitDto
): Promise<ClubBenefitData> {
  return apiClient.patch<ClubBenefitData>(`/clubs/${clubId}/benefits/${benefitId}`, data, {
    requiresAuth: true,
  });
}

/**
 * Delete a benefit (Teachers/Admins only)
 */
export async function deleteClubBenefit(clubId: string, benefitId: string): Promise<void> {
  return apiClient.delete(`/clubs/${clubId}/benefits/${benefitId}`, {
    requiresAuth: true,
  });
}

// ========================================
// CLUB FAQS CRUD
// ========================================

import type { ClubFaqData } from '../types/clubs';

export interface CreateClubFaqDto {
  question: string;
  answer: string;
  order_index: number;
}

export interface UpdateClubFaqDto {
  question?: string;
  answer?: string;
  order_index?: number;
}

/**
 * Get all FAQs for a club (Public)
 */
export async function getClubFaqs(clubId: string): Promise<ClubFaqData[]> {
  return apiClient.get<ClubFaqData[]>(`/clubs/${clubId}/faqs`, {
    requiresAuth: false,
  });
}

/**
 * Get a single FAQ by ID (Public)
 */
export async function getClubFaqById(
  clubId: string,
  faqId: string
): Promise<ClubFaqData> {
  return apiClient.get<ClubFaqData>(`/clubs/${clubId}/faqs/${faqId}`, {
    requiresAuth: false,
  });
}

/**
 * Create a new FAQ for a club (Teachers/Admins only)
 */
export async function createClubFaq(
  clubId: string,
  data: CreateClubFaqDto
): Promise<ClubFaqData> {
  return apiClient.post<ClubFaqData>(`/clubs/${clubId}/faqs`, data, {
    requiresAuth: true,
  });
}

/**
 * Update a FAQ (Teachers/Admins only)
 */
export async function updateClubFaq(
  clubId: string,
  faqId: string,
  data: UpdateClubFaqDto
): Promise<ClubFaqData> {
  return apiClient.patch<ClubFaqData>(`/clubs/${clubId}/faqs/${faqId}`, data, {
    requiresAuth: true,
  });
}

/**
 * Delete a FAQ (Teachers/Admins only)
 */
export async function deleteClubFaq(clubId: string, faqId: string): Promise<void> {
  return apiClient.delete(`/clubs/${clubId}/faqs/${faqId}`, {
    requiresAuth: true,
  });
}

/**
 * Upload club image to Cloudflare Images
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param file - Image file to upload
 * @returns Upload result with Cloudflare Images URL
 *
 * @example
 * ```ts
 * const result = await uploadClubImage(imageFile);
 * console.log(result.url); // Cloudflare Images URL
 * ```
 */
export async function uploadClubImage(
  file: File
): Promise<{ url: string; cf_image_id: string; cf_image_url: string; fileName: string; fileSize: number; mimeType: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.request<any>('/clubs/upload-image', {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    },
  });

  return response;
}
