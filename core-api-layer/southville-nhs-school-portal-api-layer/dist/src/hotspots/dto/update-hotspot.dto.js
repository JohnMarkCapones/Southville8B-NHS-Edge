"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHotspotDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_hotspot_dto_1 = require("./create-hotspot.dto");
class UpdateHotspotDto extends (0, swagger_1.PartialType)(create_hotspot_dto_1.CreateHotspotDto) {
}
exports.UpdateHotspotDto = UpdateHotspotDto;
//# sourceMappingURL=update-hotspot.dto.js.map