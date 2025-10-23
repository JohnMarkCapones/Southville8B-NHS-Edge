import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserType {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  STUDENT = 'student',
}

export class BulkUserDto {
  @IsEnum(UserType)
  @ApiProperty({
    enum: UserType,
    description: 'Type of user to create',
    example: UserType.TEACHER,
  })
  userType: UserType;

  @ApiProperty({
    description: 'User data based on userType',
    example: {
      email: 'john.doe@school.edu',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      birthday: '1985-05-15',
    },
  })
  data: any;
}

export class BulkCreateUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Type(() => BulkUserDto)
  @ApiProperty({
    description: 'Array of users to create (max 100)',
    type: [BulkUserDto],
    minItems: 1,
    maxItems: 100,
    example: [
      {
        userType: 'teacher',
        data: {
          email: 'john.doe@school.edu',
          fullName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          birthday: '1985-05-15',
        },
      },
      {
        userType: 'student',
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          studentId: 'STU-2024-002',
          lrnId: '123456789013',
          birthday: '2008-03-20',
          gradeLevel: 'Grade 10',
          enrollmentYear: 2024,
        },
      },
    ],
  })
  users: BulkUserDto[];
}
