"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClubMembershipDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_club_membership_dto_1 = require("./create-club-membership.dto");
const swagger_2 = require("@nestjs/swagger");
class UpdateClubMembershipDto extends (0, swagger_1.PartialType)((0, swagger_2.OmitType)(create_club_membership_dto_1.CreateClubMembershipDto, ['studentId', 'clubId'])) {
}
exports.UpdateClubMembershipDto = UpdateClubMembershipDto;
//# sourceMappingURL=update-club-membership.dto.js.map