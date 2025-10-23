import { CreateClubMembershipDto } from './create-club-membership.dto';
declare const UpdateClubMembershipDto_base: import("@nestjs/common").Type<Partial<Omit<CreateClubMembershipDto, "studentId" | "clubId">>>;
export declare class UpdateClubMembershipDto extends UpdateClubMembershipDto_base {
}
export {};
