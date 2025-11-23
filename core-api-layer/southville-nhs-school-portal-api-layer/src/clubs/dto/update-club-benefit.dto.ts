import { PartialType } from '@nestjs/swagger';
import { CreateClubBenefitDto } from './create-club-benefit.dto';

export class UpdateClubBenefitDto extends PartialType(CreateClubBenefitDto) {}
