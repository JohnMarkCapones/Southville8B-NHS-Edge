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
exports.QueryAlertDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const alert_entity_1 = require("../entities/alert.entity");
class QueryAlertDto {
    type;
    includeExpired = false;
    page = 1;
    limit = 10;
    sortBy = 'created_at';
    sortOrder = 'DESC';
}
exports.QueryAlertDto = QueryAlertDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(alert_entity_1.AlertType),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by alert type',
        required: false,
        example: 'info',
        enum: alert_entity_1.AlertType,
    }),
    __metadata("design:type", String)
], QueryAlertDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || String(value).toLowerCase() === 'true'),
    (0, swagger_1.ApiProperty)({
        description: 'Include expired alerts in results',
        required: false,
        example: false,
        default: false,
    }),
    __metadata("design:type", Boolean)
], QueryAlertDto.prototype, "includeExpired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        required: false,
        example: 1,
        minimum: 1,
        default: 1,
    }),
    __metadata("design:type", Number)
], QueryAlertDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        required: false,
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    }),
    __metadata("design:type", Number)
], QueryAlertDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['created_at', 'expires_at', 'title']),
    (0, swagger_1.ApiProperty)({
        description: 'Sort by field',
        required: false,
        example: 'created_at',
        enum: ['created_at', 'expires_at', 'title'],
        default: 'created_at',
    }),
    __metadata("design:type", String)
], QueryAlertDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    (0, class_transformer_1.Transform)(({ value }) => String(value || 'DESC').toUpperCase()),
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        required: false,
        example: 'DESC',
        enum: ['ASC', 'DESC'],
        default: 'DESC',
    }),
    __metadata("design:type", String)
], QueryAlertDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-alert.dto.js.map