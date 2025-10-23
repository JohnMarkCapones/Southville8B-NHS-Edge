"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModuleAssignmentDto = exports.AssignModuleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AssignModuleDto {
    sectionIds;
    visible = true;
}
exports.AssignModuleDto = AssignModuleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of section IDs to assign the module to',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-43d1-b789-123456789abc',
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AssignModuleDto.prototype, "sectionIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the module should be visible to students in these sections',
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AssignModuleDto.prototype, "visible", void 0);
class UpdateModuleAssignmentDto {
    visible;
}
exports.UpdateModuleAssignmentDto = UpdateModuleAssignmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the module should be visible to students in this section',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateModuleAssignmentDto.prototype, "visible", void 0);
//# sourceMappingURL=assign-module.dto.js.map