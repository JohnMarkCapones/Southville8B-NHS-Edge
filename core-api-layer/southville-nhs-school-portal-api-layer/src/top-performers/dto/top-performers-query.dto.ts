import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum TimePeriod {
  CURRENT_QUARTER = 'current-quarter',
  SEMESTER = 'semester',
  SCHOOL_YEAR = 'school-year',
  ALL_TIME = 'all-time',
}

export enum GradeLevel {
  ALL = 'all',
  GRADE_7 = '7',
  GRADE_8 = '8',
  GRADE_9 = '9',
  GRADE_10 = '10',
}

export class TopPerformersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod?: TimePeriod = TimePeriod.CURRENT_QUARTER;

  @IsOptional()
  @IsEnum(GradeLevel)
  gradeLevel?: GradeLevel = GradeLevel.ALL;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  topN?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'gwa';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class StatsQueryDto {
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod?: TimePeriod = TimePeriod.CURRENT_QUARTER;

  @IsOptional()
  @IsEnum(GradeLevel)
  gradeLevel?: GradeLevel = GradeLevel.ALL;

  @IsOptional()
  @IsString()
  academicYearId?: string;
}
