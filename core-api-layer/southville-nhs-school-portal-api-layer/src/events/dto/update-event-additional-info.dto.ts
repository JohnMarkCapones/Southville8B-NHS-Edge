import { PartialType } from '@nestjs/swagger';
import { CreateEventAdditionalInfoDto } from './create-event.dto';

export class UpdateEventAdditionalInfoDto extends PartialType(
  CreateEventAdditionalInfoDto,
) {}
