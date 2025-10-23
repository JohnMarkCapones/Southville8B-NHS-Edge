import { PartialType } from '@nestjs/swagger';
import { CreateEventScheduleDto } from './create-event.dto';

export class UpdateEventScheduleDto extends PartialType(
  CreateEventScheduleDto,
) {}
