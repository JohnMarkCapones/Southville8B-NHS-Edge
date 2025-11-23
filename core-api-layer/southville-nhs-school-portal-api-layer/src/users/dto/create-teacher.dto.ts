import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto, UserRole, UserType } from './create-user.dto';

export class CreateTeacherDto extends CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'John',
    description: 'First name',
    minLength: 2,
    maxLength: 50,
  })
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    minLength: 2,
    maxLength: 50,
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @ApiProperty({
    example: 'Michael',
    description: 'Middle name',
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  middleName?: string;

  @IsDateString()
  @ApiProperty({
    example: '1985-05-15',
    description: 'Birthday (used for password generation)',
    type: 'string',
    format: 'date',
  })
  birthday: string;

  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(80)
  @ApiProperty({
    example: 35,
    description: 'Age',
    required: false,
    minimum: 18,
    maximum: 80,
  })
  age?: number;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description: 'Subject specialization ID from subjects table',
  })
  subjectSpecializationId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description: 'Department ID from departments table',
  })
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    required: false,
    description: 'Advisory section ID from sections table',
  })
  advisorySectionId?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number in international format',
    required: false,
    minLength: 10,
    maxLength: 15,
  })
  phoneNumber?: string;

  // Set default values for base class
  constructor() {
    super();
    this.role = UserRole.TEACHER;
    this.userType = UserType.TEACHER;
  }
}
