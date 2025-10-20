import { ApiProperty } from '@nestjs/swagger';

export class TagDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag slug' })
  slug: string;

  @ApiProperty({ description: 'Tag color (optional)' })
  color?: string;
}
