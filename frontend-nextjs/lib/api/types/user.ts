/**
 * User Profile Types
 * Based on Supabase database schema
 */

// Base User entity
export interface User {
  id: string;
  full_name: string | null;
  email: string;
  password_hash?: string; // Should never be exposed to frontend
  role_id: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  
  // Joined data
  role?: Role;
  teacher?: Teacher;
  admin?: Admin;
  student?: Student;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

// Role entity
export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Teacher extended data
export interface Teacher {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  age?: number;
  birthday?: string;
  subject_specialization_id?: string;
  department_id?: string;
  advisory_section_id?: string;
  created_at: string;
  updated_at: string;
}

// Admin extended data
export interface Admin {
  id: string;
  user_id: string;
  role_description?: string;
  name?: string;
  email: string;
  phone_number?: string;
}

// Section data (joined from sections table)
export interface Section {
  id: string;
  name: string;
  grade_level?: string;
  adviser_id?: string;
  room_id?: string;
  building_id?: string;
  created_at: string;
  updated_at: string;
}

// Student extended data
export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_id: string;
  lrn_id: string;
  grade_level?: string;
  enrollment_year?: number;
  honor_status?: string;
  rank?: number;
  section_id?: string;
  age?: number;
  birthday?: string;
  // Joined relations
  sections?: Section; // Note: Supabase returns singular when joining on FK
}

// User Profile
export interface UserProfile {
  id: string;
  user_id: string;
  avatar?: string;
  address?: string;
  bio?: string;
  phone_number?: string;
  social_media_links?: Record<string, string>;
}

// User Preferences
export interface UserPreferences {
  id: string;
  user_id: string;
  web_theme: 'light' | 'dark';
  desktop_theme: 'light' | 'dark';
  language: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// User Profile Response (from GET /users/me or GET /users/:id/profile)
export interface UserProfileResponse extends User {
  // All user fields plus joined relations
}

// User summary for listings
export interface UserSummary {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  status: string;
}

