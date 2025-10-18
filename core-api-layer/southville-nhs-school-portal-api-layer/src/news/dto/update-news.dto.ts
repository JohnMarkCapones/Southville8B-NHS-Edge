import { PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';

/**
 * Update news DTO
 * All fields from CreateNewsDto are optional
 * Can only update articles in draft or pending_approval status
 */
export class UpdateNewsDto extends PartialType(CreateNewsDto) {}
