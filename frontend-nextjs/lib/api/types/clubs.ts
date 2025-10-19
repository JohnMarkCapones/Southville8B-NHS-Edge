/**
 * ========================================
 * CLUBS API TYPES
 * ========================================
 * TypeScript type definitions for the Clubs backend API.
 * 
 * Backend Source: core-api-layer/.../src/clubs/
 * Base URL: http://localhost:3004/api/v1/clubs
 * 
 * These types match the backend DTOs and entities exactly.
 */

// ========================================
// CORE CLUB TYPES
// ========================================

export interface Club {
  id: string;
  name: string;
  description: string;
  president_id: string;
  vp_id: string;
  secretary_id: string;
  advisor_id: string;
  co_advisor_id?: string;
  domain_id: string;
  created_at: string;
  updated_at: string;
  
  // Relations (populated by backend)
  president?: User;
  vp?: User;
  secretary?: User;
  advisor?: User;
  co_advisor?: User;
  domain?: Domain;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
}

export interface Domain {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// ========================================
// CLUB FORMS & APPLICATIONS
// ========================================

export interface ClubForm {
  id: string;
  club_id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions?: ClubFormQuestion[];
}

export interface ClubFormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  is_required: boolean;
  order_index: number;
  options?: ClubFormQuestionOption[];
}

export interface ClubFormQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  order_index: number;
}

export interface ClubFormResponse {
  id: string;
  form_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  answers?: ClubFormAnswer[];
}

export interface ClubFormAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ClubListResponse extends Array<Club> {
  // Backend returns clubs directly as an array
}

export interface ClubResponse {
  data: Club;
}

export interface ClubFormResponse {
  data: ClubForm;
}

export interface ClubFormListResponse {
  data: ClubForm[];
}

// ========================================
// CREATE/UPDATE DTOs
// ========================================

export interface CreateClubDto {
  name: string;
  description: string;
  president_id: string;
  vp_id: string;
  secretary_id: string;
  advisor_id: string;
  co_advisor_id?: string;
  domain_id: string;
}

export interface UpdateClubDto {
  name?: string;
  description?: string;
  president_id?: string;
  vp_id?: string;
  secretary_id?: string;
  advisor_id?: string;
  co_advisor_id?: string;
  domain_id?: string;
}

export interface CreateClubFormDto {
  club_id: string;
  title: string;
  description: string;
  is_active?: boolean;
}

export interface CreateClubFormQuestionDto {
  form_id: string;
  question_text: string;
  question_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  is_required?: boolean;
  order_index?: number;
}

export interface SubmitClubFormResponseDto {
  form_id: string;
  answers: {
    question_id: string;
    answer_text: string;
  }[];
}

// ========================================
// QUERY PARAMETERS
// ========================================

export interface ClubQueryParams {
  page?: number;
  limit?: number;
  domain_id?: string;
  search?: string;
}

export interface ClubFormQueryParams {
  club_id?: string;
  is_active?: boolean;
}

// ========================================
// FRONTEND-SPECIFIC TYPES
// ========================================

// Enhanced club type for frontend display
export interface ClubDisplay extends Club {
  slug: string;
  memberCount: number;
  icon: string;
  color: string;
  meetingTime?: string;
  location?: string;
  benefits?: ClubBenefit[];
  upcomingEvents?: ClubEvent[];
  faqItems?: ClubFAQ[];
  stats?: ClubStat[];
}

export interface ClubBenefit {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ClubEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: string;
  icon: string;
}

export interface ClubFAQ {
  question: string;
  answer: string;
}

export interface ClubStat {
  number: string;
  label: string;
  icon: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type ClubStatus = 'active' | 'inactive' | 'pending';
export type ClubRole = 'president' | 'vp' | 'secretary' | 'advisor' | 'co_advisor' | 'member';
export type FormStatus = 'pending' | 'approved' | 'rejected';
