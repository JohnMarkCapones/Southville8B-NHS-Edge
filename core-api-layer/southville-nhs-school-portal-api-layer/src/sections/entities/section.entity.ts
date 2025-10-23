export interface Section {
  id: string;
  name: string;
  grade_level: string;
  teacher_id?: string;
  building_id?: string;
  floor_id?: string;
  room_id?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface SectionWithDetails extends Section {
  // Teacher details
  teacher_full_name?: string;
  teacher_email?: string;
  
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