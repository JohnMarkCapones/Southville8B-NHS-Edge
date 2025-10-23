"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAnnouncementDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_announcement_dto_1 = require("./create-announcement.dto");
class UpdateAnnouncementDto extends (0, swagger_1.PartialType)(create_announcement_dto_1.CreateAnnouncementDto) {
}
exports.UpdateAnnouncementDto = UpdateAnnouncementDto;
//# sourceMappingURL=update-announcement.dto.js.map