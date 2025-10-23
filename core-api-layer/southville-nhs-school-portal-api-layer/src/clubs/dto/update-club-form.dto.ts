import { PartialType } from '@nestjs/swagger';
import { CreateClubFormDto } from './create-club-form.dto';

export class UpdateClubFormDto extends PartialType(CreateClubFormDto) {}
