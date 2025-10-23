import { PartialType } from '@nestjs/swagger';
import { CreateCalendarDayDto } from './create-calendar-day.dto';

export class UpdateCalendarDayDto extends PartialType(CreateCalendarDayDto) {}
