import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateScheduleDto } from './create-schedule.dto';

export class BulkCreateSchedulesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one schedule is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 schedules allowed per request' })
  @ValidateNested({ each: true })
  @Type(() => CreateScheduleDto)
  @ApiProperty({
    description: 'Array of schedules to create',
    type: [CreateScheduleDto],
    maxItems: 100,
    minItems: 1,
  })
  schedules: CreateScheduleDto[];
}
