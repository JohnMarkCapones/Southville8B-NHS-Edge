"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFloorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_floor_dto_1 = require("./create-floor.dto");
class UpdateFloorDto extends (0, swagger_1.PartialType)(create_floor_dto_1.CreateFloorDto) {
}
exports.UpdateFloorDto = UpdateFloorDto;
//# sourceMappingURL=update-floor.dto.js.map