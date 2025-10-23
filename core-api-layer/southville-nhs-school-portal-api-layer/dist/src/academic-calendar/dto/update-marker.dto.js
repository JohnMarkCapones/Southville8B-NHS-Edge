"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMarkerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_marker_dto_1 = require("./create-marker.dto");
class UpdateMarkerDto extends (0, swagger_1.PartialType)(create_marker_dto_1.CreateMarkerDto) {
}
exports.UpdateMarkerDto = UpdateMarkerDto;
//# sourceMappingURL=update-marker.dto.js.map