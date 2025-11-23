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

export interface ClubGoal {
  id: string;
  club_id: string;
  goal_text: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ClubBenefitData {
  id: string;
  club_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ClubFaqData {
  id: string;
  club_id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  president_id?: string;
  vp_id?: string;
  secretary_id?: string;
  advisor_id?: string;
  co_advisor_id?: string;
  domain_id?: string;
  mission_statement?: string;
  mission_title?: string;
  mission_description?: string;
  email?: string;
  championship_wins?: number;
  benefits_title?: string;
  benefits_description?: string;
  club_image?: string; // Cloudflare Images URL for header background
  club_logo?: string; // Cloudflare Images URL for logo next to title
  created_at: string;
  updated_at: string;

  // Relations (populated by backend)
  president?: User;
  vp?: User;
  secretary?: User;
  advisor?: User;
  co_advisor?: User;
  domain?: Domain;

  // Nested data (populated by backend)
  goals?: ClubGoal[];
  benefits?: ClubBenefitData[];
  faqs?: ClubFaqData[];
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
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;

  // Populated relations
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  reviewed_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  answers?: ClubFormAnswerWithQuestion[];
}

export interface ClubFormAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string;
  answer_value?: string;
}

export interface ClubFormAnswerWithQuestion extends ClubFormAnswer {
  question?: {
    id: string;
    question_text: string;
    question_type: string;
  };
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ClubListResponse extends Array<Club> {
  // Backend returns clubs directly as an array
}

// Note: API wrapper types are no longer used
// Backend returns data directly, not wrapped in {data: ...}
// - getClubs() returns: Club[]
// - getClubById() returns: Club
// - getClubForms() returns: ClubForm[]
// - getClubFormById() returns: ClubForm
// - getClubFormResponses() returns: ClubFormResponse[] (entity, not wrapper)
//
// IMPORTANT: ClubFormResponse at line 120 is an entity (student's form submission),
// not an API response wrapper type

// ========================================
// CREATE/UPDATE DTOs
// ========================================

export interface CreateClubDto {
  name: string;
  description?: string;
  president_id?: string;
  vp_id?: string;
  secretary_id?: string;
  advisor_id?: string;
  co_advisor_id?: string;
  domain_id?: string;
  mission_statement?: string;
  email?: string;
  championship_wins?: number;
  benefits_title?: string;
  benefits_description?: string;
  club_image?: string;
  club_logo?: string;
  goals?: Array<{
    goal_text: string;
    order_index: number;
  }>;
  benefits?: Array<{
    title: string;
    description: string;
    order_index: number;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
    order_index: number;
  }>;
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
  mission_statement?: string;
  mission_title?: string;
  mission_description?: string;
  email?: string;
  championship_wins?: number;
  benefits_title?: string;
  benefits_description?: string;
  club_image?: string;
  club_logo?: string;
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

// Note: SubmitClubFormResponseDto structure updated
// Backend uses path parameters: /clubs/{clubId}/forms/{formId}/responses
// Only the answers array is sent in the request body
export interface SubmitClubFormResponseDto {
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

// Note: ClubFormQueryParams removed - backend uses path parameters instead of query params
// Use clubId as path parameter: /clubs/{clubId}/forms

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
