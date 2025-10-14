import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FormType {
  MEMBER_REGISTRATION = 'member_registration',
  TEACHER_APPLICATION = 'teacher_application',
  EVENT_SIGNUP = 'event_signup',
  SURVEY = 'survey',
  FEEDBACK = 'feedback',
}

export class CreateClubFormDto {
  @ApiProperty({
    description: 'Form name',
    example: 'Member Registration Form',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'Register to become a member of our club',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the form is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether responses should be auto-approved',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  auto_approve?: boolean;

  @ApiPropertyOptional({
    description: 'Type of form',
    example: 'member_registration',
    enum: FormType,
    default: FormType.MEMBER_REGISTRATION,
  })
  @IsOptional()
  @IsEnum(FormType)
  form_type?: FormType;
}
