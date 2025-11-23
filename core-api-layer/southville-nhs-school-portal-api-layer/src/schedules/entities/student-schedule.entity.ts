import { ApiProperty } from '@nestjs/swagger';

export class StudentSchedule {
  @ApiProperty({ description: 'Student schedule assignment ID' })
  id: string;

  @ApiProperty({ description: 'Schedule ID' })
  scheduleId: string;

  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Assignment timestamp' })
  createdAt: string;

  // Relations
  @ApiProperty({ description: 'Schedule information', required: false })
  schedule?: {
    id: string;
    subjectId: string;
    teacherId: string;
    sectionId: string;
    roomId: string;
    buildingId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    schoolYear: string;
    semester: string;
  };

  @ApiProperty({ description: 'Student information', required: false })
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    studentId: string;
    lrnId: string;
    gradeLevel?: string;
    sectionId?: string;
  };
}
