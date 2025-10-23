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
exports.AssignStudentsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AssignStudentsDto {
    studentIds;
}
exports.AssignStudentsDto = AssignStudentsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one student is required' }),
    (0, class_validator_1.ArrayMaxSize)(50, { message: 'Maximum 50 students allowed per request' }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        description: 'Array of student IDs to assign to the schedule',
        type: [String],
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
        ],
        maxItems: 50,
        minItems: 1,
    }),
    __metadata("design:type", Array)
], AssignStudentsDto.prototype, "studentIds", void 0);
//# sourceMappingURL=assign-students.dto.js.map