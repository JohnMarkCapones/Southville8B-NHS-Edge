import { PartialType } from '@nestjs/swagger';
import { CreateCampusFacilityDto } from './create-campus-facility.dto';

export class UpdateCampusFacilityDto extends PartialType(
  CreateCampusFacilityDto,
) {}
