"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmergencyContactDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_emergency_contact_dto_1 = require("./create-emergency-contact.dto");
class UpdateEmergencyContactDto extends (0, swagger_1.PartialType)(create_emergency_contact_dto_1.CreateEmergencyContactDto) {
}
exports.UpdateEmergencyContactDto = UpdateEmergencyContactDto;
//# sourceMappingURL=update-emergency-contact.dto.js.map