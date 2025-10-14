import { PartialType } from '@nestjs/swagger';
import { CreateEventFaqDto } from './create-event.dto';

export class UpdateEventFaqDto extends PartialType(CreateEventFaqDto) {}
