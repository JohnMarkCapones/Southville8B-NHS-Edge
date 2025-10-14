import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsTimeZone,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, Semester } from '../entities/schedule.entity';

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

export class ConflictCheckDto {
  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Schedule ID to exclude from conflict check (for updates)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  excludeScheduleId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Teacher ID to check for conflicts',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  teacherId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Room ID to check for conflicts',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  roomId?: string;

  @IsUUID('4')
  @IsOptional()
  @ApiProperty({
    description: 'Section ID to check for conflicts',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  sectionId?: string;

  @IsEnum(DayOfWeek)
  @IsOptional()
  @ApiProperty({
    description: 'Day of the week to check',
    enum: DayOfWeek,
    required: false,
    example: DayOfWeek.MONDAY,
  })
  dayOfWeek?: DayOfWeek;

  @IsString()
  @IsOptional()
  @Validate(IsValidTimeFormatConstraint)
  @ApiProperty({
    description: 'Start time to check',
    required: false,
    example: '08:00:00',
  })
  startTime?: string;

  @IsString()
  @IsOptional()
  @Validate(IsValidTimeFormatConstraint)
  @Validate(IsValidTimeOrderConstraint)
  @ApiProperty({
    description: 'End time to check',
    required: false,
    example: '09:00:00',
  })
  endTime?: string;

  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: 'School year to check conflicts for',
    required: false,
    example: 2024,
  })
  schoolYear?: number;

  @IsEnum(Semester)
  @IsOptional()
  @ApiProperty({
    description: 'Semester to check conflicts for',
    enum: Semester,
    required: false,
    example: Semester.FIRST,
  })
  semester?: Semester;
}
