import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto, UserRole, UserType } from './create-user.dto';

export class CreateAdminDto extends CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsDateString()
  @ApiProperty({
    example: '1980-03-20',
    description: 'Birthday (used for password generation)',
    type: 'string',
    format: 'date',
  })
  birthday: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'System Administrator',
    description: 'Role description',
    required: false,
    maxLength: 255,
  })
  roleDescription?: string;

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
    this.role = UserRole.ADMIN;
    this.userType = UserType.ADMIN;
  }
}
