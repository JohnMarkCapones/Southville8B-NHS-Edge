import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateClubAnnouncementDto } from './create-club-announcement.dto';

export class UpdateClubAnnouncementDto extends PartialType(
  OmitType(CreateClubAnnouncementDto, ['club_id'] as const),
) {}
