import { ApiProperty } from '@nestjs/swagger';
import { Teacher } from './teacher.entity';
import { Admin } from './admin.entity';
import { Student } from './student.entity';

export class User {
  @ApiProperty({ description: 'User ID (UUID)' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  full_name: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Role ID (UUID)' })
  role_id: string;

  @ApiProperty({ description: 'User status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;

  // Related data
  @ApiProperty({ description: 'Role name', required: false })
  role?: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Teacher data', required: false })
  teacher?: Teacher;

  @ApiProperty({ description: 'Admin data', required: false })
  admin?: Admin;

  @ApiProperty({ description: 'Student data', required: false })
  student?: Student;
}
