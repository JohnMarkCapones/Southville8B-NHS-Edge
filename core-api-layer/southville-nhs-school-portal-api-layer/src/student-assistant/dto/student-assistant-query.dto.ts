import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export enum StudentAssistantQueryType {
  EVENTS = 'events',
  NEWS = 'news',
  SCHEDULE = 'schedule',
  SUBJECTS = 'subjects',
  MODULES = 'modules',
  QUIZZES = 'quizzes',
  GRADES = 'grades',
  CLUBS = 'clubs',
}

export type StudentAssistantQueryFilters = Record<string, unknown>;

export class StudentAssistantQueryDto {
  @IsEnum(StudentAssistantQueryType, {
    message: 'type must be one of the supported student assistant query types',
  })
  type: StudentAssistantQueryType;

  @IsOptional()
  @IsUUID('4', { message: 'targetStudentId must be a valid UUID' })
  targetStudentId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'targetUserId must be a valid UUID' })
  targetUserId?: string;

  @IsOptional()
  @IsObject()
  filters?: StudentAssistantQueryFilters;
}



