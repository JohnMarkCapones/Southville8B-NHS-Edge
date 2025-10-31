export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface StudentInfo {
  id: string;
  student_id: string;
  lrn_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  grade_level?: string;
  section_id?: string;
  section?: {
    id: string;
    name: string;
    grade_level?: string;
  };
  age?: number;
  birthday?: string;
  honor_status?: string;
  rank?: number;
}

export interface ProfileInfo {
  id: string;
  avatar?: string;
  address?: string;
  bio?: string;
  phone_number?: string;
  social_media_links?: any;
  birthday?: string;
  gender?: string;
}

export interface UserProfile extends User {
  student?: StudentInfo;
  profile?: ProfileInfo;
}
