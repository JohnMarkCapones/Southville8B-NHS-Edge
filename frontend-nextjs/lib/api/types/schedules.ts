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

  // Relations
  subject?: {
    id: string;
    subjectName: string;
    description?: string;
    gradeLevel?: number;
    colorHex?: string;
  };

  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
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
