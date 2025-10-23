import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

/**
 * Update Tag DTO
 * All fields from CreateTagDto are optional for updates
 */
export class UpdateTagDto extends PartialType(CreateTagDto) {}
