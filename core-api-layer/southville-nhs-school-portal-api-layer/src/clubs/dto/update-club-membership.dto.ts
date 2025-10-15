import { PartialType } from '@nestjs/swagger';
import { CreateClubMembershipDto } from './create-club-membership.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateClubMembershipDto extends PartialType(
  OmitType(CreateClubMembershipDto, ['studentId', 'clubId'] as const),
) {}
