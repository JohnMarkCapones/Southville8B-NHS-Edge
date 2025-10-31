import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsTimeZone,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, Semester, GradingPeriod } from '../entities/schedule.entity';

@ValidatorConstraint({ name: 'isValidTimeFormat', async: false })
class IsValidTimeFormatConstraint implements ValidatorConstraintInterface {
  validate(timeString: string) {
    if (!timeString) return false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }

  defaultMessage() {
    return 'Time must be in HH:mm:ss format (e.g., 08:30:00)';
  }
}

@ValidatorConstraint({ name: 'isValidSchoolYear', async: false })
class IsValidSchoolYearConstraint implements ValidatorConstraintInterface {
  validate(schoolYear: string) {
    if (!schoolYear) return false;
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(schoolYear)) return false;

    const [startYear, endYear] = schoolYear.split('-').map(Number);
    return endYear === startYear + 1;
  }

  defaultMessage() {
    return 'School year must be in YYYY-YYYY format where end year is start year + 1 (e.g., 2024-2025)';
  }
}

@ValidatorConstraint({ name: 'isValidTimeOrder', async: false })
class IsValidTimeOrderConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const startTime = object.startTime;
    const endTime = object.endTime;

    if (!startTime || !endTime) return true;

    return startTime < endTime;
  }

  defaultMessage() {
    return 'End time must be after start time';
  }
}

export class CreateScheduleDto {
  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({
    description: 'Subject ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  subjectId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({
    description: 'Teacher ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  teacherId: string;

  @IsUUID('4')
  @IsNotEmpty()
  @ApiProperty({
    description: 'Section ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  sectionId: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'Room ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
  })
  roomId?: string;

  @IsUUID('4')
  @ApiProperty({
    description: 'Building ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174004',
    required: false,
  })
  buildingId?: string;

  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimeFormatConstraint)
  @ApiProperty({
    description: 'Start time in HH:mm:ss format',
    example: '08:00:00',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidTimeFormatConstraint)
  @Validate(IsValidTimeOrderConstraint)
  @ApiProperty({
    description: 'End time in HH:mm:ss format',
    example: '09:00:00',
  })
  endTime: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsValidSchoolYearConstraint)
  @ApiProperty({
    description: 'School year in YYYY-YYYY format',
    example: '2024-2025',
  })
  schoolYear: string;

  @IsEnum(GradingPeriod)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Grading period (quarters)',
    enum: GradingPeriod,
    example: GradingPeriod.Q1,
  })
  gradingPeriod: GradingPeriod;

  @IsOptional()
  @IsEnum(Semester)
  @ApiProperty({
    description: 'Semester (legacy, optional)',
    enum: Semester,
    required: false,
  })
  semester?: Semester;
}
