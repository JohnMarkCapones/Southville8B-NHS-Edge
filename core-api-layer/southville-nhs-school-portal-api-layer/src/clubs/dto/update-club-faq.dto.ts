import { PartialType } from '@nestjs/swagger';
import { CreateClubFaqDto } from './create-club-faq.dto';

export class UpdateClubFaqDto extends PartialType(CreateClubFaqDto) {}
