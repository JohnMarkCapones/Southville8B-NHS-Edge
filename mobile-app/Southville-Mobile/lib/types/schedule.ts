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

export interface Subject {
  id: string;
  subject_name: string;
  description?: string;
  grade_level?: number;
  color_hex?: string;
}

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Section {
  id: string;
  name: string;
  grade_level?: string;
  teacher_id?: string;
}

export interface Room {
  id: string;
  room_number: string;
  capacity?: number;
  floor_id: string;
  floor?: {
    id: string;
    floor_number: number;
    building?: {
      id: string;
      name: string;
    };
  };
}

export interface Building {
  id: string;
  name: string;
}

export interface Schedule {
  id: string;
  subjectId: string;
  teacherId: string;
  sectionId: string;
  roomId: string;
  buildingId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  schoolYear: string;
  semester: Semester;
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  teacher?: Teacher;
  section?: Section;
  room?: Room;
  building?: Building;
}
