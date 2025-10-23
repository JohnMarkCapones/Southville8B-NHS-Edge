"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScheduleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_schedule_dto_1 = require("./create-schedule.dto");
class UpdateScheduleDto extends (0, swagger_1.PartialType)(create_schedule_dto_1.CreateScheduleDto) {
}
exports.UpdateScheduleDto = UpdateScheduleDto;
//# sourceMappingURL=update-schedule.dto.js.map