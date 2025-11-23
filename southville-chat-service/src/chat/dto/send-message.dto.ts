import { IsString, IsUUID, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation ID',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    description: 'Message content',
    maxLength: 5000,
  })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    enum: MessageType,
    description: 'Message type',
    default: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({
    description: 'Attachment URL (for image/file messages)',
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

