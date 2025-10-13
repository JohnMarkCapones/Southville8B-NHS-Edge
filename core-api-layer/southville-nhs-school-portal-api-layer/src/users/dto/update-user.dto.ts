import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto, UserRole, UserType } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    required: false,
    description: 'Updated email address',
  })
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Updated full name',
  })
  fullName?: string;

  @ApiProperty({
    required: false,
    description: 'Updated role',
  })
  role?: UserRole;

  @ApiProperty({
    required: false,
    description: 'Updated user type',
  })
  userType?: UserType;
}
