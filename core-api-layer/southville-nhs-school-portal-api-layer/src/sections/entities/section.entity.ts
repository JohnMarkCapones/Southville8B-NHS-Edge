export interface Section {
  id: string;
  name: string; // Maps to database column 'name'
  grade_level: string; // Database uses VARCHAR
  teacher_id?: string; // Maps to database column 'teacher_id'
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SectionWithDetails extends Section {
  // Teacher/Adviser details (from view)
  adviser_name?: string; // Maps to full_name from users table
  adviser_email?: string;

  // Building details
  building_name?: string;
  building_code?: string;

  // Floor details
  floor_name?: string;
  floor_number?: number;

  // Room details
  room_number?: string;
  room_name?: string;
  room_capacity?: number;
}

export interface SectionStudent {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  grade_level?: string;
  section_id?: string;
}

export interface SectionWithStudents extends SectionWithDetails {
  students?: SectionStudent[];
}
