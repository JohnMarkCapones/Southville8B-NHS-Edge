import { PartialType } from '@nestjs/swagger';
import { CreateClubPositionDto } from './create-club-position.dto';

export class UpdateClubPositionDto extends PartialType(CreateClubPositionDto) {}
