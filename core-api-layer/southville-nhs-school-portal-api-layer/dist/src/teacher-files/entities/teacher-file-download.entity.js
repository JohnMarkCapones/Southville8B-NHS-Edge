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
exports.TeacherFileDownload = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeacherFileDownload {
    id;
    file_id;
    user_id;
    downloaded_at;
    ip_address;
    user_agent;
    success;
}
exports.TeacherFileDownload = TeacherFileDownload;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "file_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Download timestamp',
        example: '2024-01-15T14:30:00Z',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "downloaded_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User IP address',
        example: '192.168.1.1',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User agent string',
        example: 'Mozilla/5.0...',
    }),
    __metadata("design:type", String)
], TeacherFileDownload.prototype, "user_agent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Download success flag',
        default: true,
    }),
    __metadata("design:type", Boolean)
], TeacherFileDownload.prototype, "success", void 0);
//# sourceMappingURL=teacher-file-download.entity.js.map