import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class AssignModuleDto {
  @ApiProperty({
    description: 'Array of section IDs to assign the module to',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b789-123456789abc',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds: string[];

  @ApiPropertyOptional({
    description:
      'Whether the module should be visible to students in these sections',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  visible?: boolean = true;
}

export class UpdateModuleAssignmentDto {
  @ApiPropertyOptional({
    description:
      'Whether the module should be visible to students in this section',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
