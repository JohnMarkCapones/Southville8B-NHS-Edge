/**
 * Schedule Types
 * Type definitions for schedule-related API responses
 */

export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export enum Semester {
  FIRST = '1st',
  SECOND = '2nd',
}

export interface Schedule {
  id: string;
  subjectId: string;
  teacherId: string;
  sectionId: string;
  roomId: string;
  buildingId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:MM:SS"
  endTime: string; // Format: "HH:MM:SS"
  schoolYear: string; // Format: "2024-2025"
  semester: Semester;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived';
  is_published?: boolean;
  published_at?: string | null;
  recurring_rule?: string | null;
  version?: number;

  // Relations
  subject?: {
    id: string;
    subjectName: string; // Backend returns camelCase
    description?: string;
    gradeLevel?: number; // Backend returns camelCase
    colorHex?: string; // Backend returns camelCase
  };

  teacher?: {
    id: string;
    firstName: string; // Backend returns camelCase
    lastName: string; // Backend returns camelCase
    middleName?: string; // Backend returns camelCase
    user?: {
      id: string;
      fullName: string;
      email: string;
    };
  };

  section?: {
    id: string;
    name: string;
    gradeLevel?: string;
    teacherId?: string;
  };

  room?: {
    id: string;
    roomNumber: string;
    capacity?: number;
    floorId: string;
    floor?: {
      id: string;
      floorNumber: number;
      building?: {
        id: string;
        name: string;
      };
    };
  };

  building?: {
    id: string;
    name: string;
  };

  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    studentId: string;
    lrnId: string;
    gradeLevel?: string;
  }>;
}
