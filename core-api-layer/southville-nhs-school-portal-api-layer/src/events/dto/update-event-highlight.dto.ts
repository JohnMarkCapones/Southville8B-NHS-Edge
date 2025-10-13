import { PartialType } from '@nestjs/swagger';
import { CreateEventHighlightDto } from './create-event.dto';

export class UpdateEventHighlightDto extends PartialType(
  CreateEventHighlightDto,
) {}
