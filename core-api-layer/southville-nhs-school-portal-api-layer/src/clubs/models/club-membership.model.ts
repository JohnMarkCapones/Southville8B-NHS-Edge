import { ApiProperty } from '@nestjs/swagger';

export class ClubMembership {
  @ApiProperty({ description: 'Membership ID' })
  id: string;

  @ApiProperty({ description: 'Student ID' })
  studentId: string;

  @ApiProperty({ description: 'Club ID' })
  clubId: string;

  @ApiProperty({ description: 'Position ID' })
  positionId: string;

  @ApiProperty({ description: 'Joined at' })
  joinedAt: Date;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  // Populated fields
  @ApiProperty({ description: 'Student details', required: false })
  student?: any;

  @ApiProperty({ description: 'Club details', required: false })
  club?: any;

  @ApiProperty({ description: 'Position details', required: false })
  position?: any;
}
