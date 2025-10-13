import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
}

export enum UserType {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  STUDENT = 'student',
}

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'john.doe@school.edu',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 2,
    maxLength: 100,
  })
  fullName: string;

  @IsEnum(UserRole)
  @ApiProperty({
    enum: UserRole,
    example: UserRole.TEACHER,
    description: 'User role',
  })
  role: UserRole;

  @IsEnum(UserType)
  @ApiProperty({
    enum: UserType,
    example: UserType.TEACHER,
    description: 'User type',
  })
  userType: UserType;
}
