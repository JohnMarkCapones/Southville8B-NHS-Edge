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
exports.UpdateGwaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateGwaDto {
    gwa;
    remarks;
    honor_status;
}
exports.UpdateGwaDto = UpdateGwaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'General Weighted Average (50-100)',
        example: 87.5,
        minimum: 50,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateGwaDto.prototype, "gwa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional remarks',
        example: 'Excellent performance',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGwaDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Honor status',
        example: 'With Honors',
        enum: ['None', 'With Honors', 'High Honors', 'Highest Honors'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateGwaDto.prototype, "honor_status", void 0);
//# sourceMappingURL=update-gwa.dto.js.map