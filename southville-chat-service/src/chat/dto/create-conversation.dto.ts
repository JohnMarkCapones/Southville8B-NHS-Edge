import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP_SECTION = 'group_section',
}

export class CreateConversationDto {
  @ApiProperty({
    enum: ConversationType,
    description: 'Type of conversation',
  })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiPropertyOptional({
    description: 'Target user ID for direct conversations',
  })
  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @ApiPropertyOptional({
    description: 'Section ID for group section conversations',
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({
    description: 'Conversation title (for group conversations)',
  })
  @IsOptional()
  @IsString()
  title?: string;
}

