import { ApiProperty } from '@nestjs/swagger';

export class Admin {
  @ApiProperty({ description: 'Admin ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'User ID (UUID)' })
  user_id: string;

  @ApiProperty({ description: 'Role description', required: false })
  role_description?: string;

  @ApiProperty({ description: 'Name' })
  name: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone_number?: string;
}
