import { ApiProperty } from '@nestjs/swagger';

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

export class Schedule {
  @ApiProperty({ description: 'Schedule ID' })
  id: string;

  @ApiProperty({ description: 'Subject ID' })
  subjectId: string;

  @ApiProperty({ description: 'Teacher ID' })
  teacherId: string;

  @ApiProperty({ description: 'Section ID' })
  sectionId: string;

  @ApiProperty({ description: 'Room ID' })
  roomId: string;

  @ApiProperty({ description: 'Building ID' })
  buildingId: string;

  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Start time',
    example: '08:00:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time',
    example: '09:00:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'School year',
    example: '2024-2025',
  })
  schoolYear: string;

  @ApiProperty({
    description: 'Semester',
    enum: Semester,
    example: Semester.FIRST,
  })
  semester: Semester;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  // Relations
  @ApiProperty({ description: 'Subject information', required: false })
  subject?: {
    id: string;
    subjectName: string;
    description?: string;
    gradeLevel?: number;
    colorHex?: string;
  };

  @ApiProperty({ description: 'Teacher information', required: false })
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

  @ApiProperty({ description: 'Section information', required: false })
  section?: {
    id: string;
    name: string;
    gradeLevel?: string;
    teacherId?: string;
  };

  @ApiProperty({ description: 'Room information', required: false })
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

  @ApiProperty({ description: 'Building information', required: false })
  building?: {
    id: string;
    buildingName: string;
  };

  @ApiProperty({
    description: 'Students enrolled in this schedule',
    type: 'array',
    required: false,
  })
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
