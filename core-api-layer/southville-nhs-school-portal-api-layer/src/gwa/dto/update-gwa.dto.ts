import { PartialType } from '@nestjs/swagger';
import { CreateGwaDto } from './create-gwa.dto';

export class UpdateGwaDto extends PartialType(CreateGwaDto) {}
