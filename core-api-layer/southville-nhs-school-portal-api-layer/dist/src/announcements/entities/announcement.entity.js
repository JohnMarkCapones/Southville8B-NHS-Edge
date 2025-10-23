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
exports.Announcement = void 0;
const swagger_1 = require("@nestjs/swagger");
class Announcement {
    id;
    userId;
    title;
    content;
    createdAt;
    updatedAt;
    expiresAt;
    type;
    visibility;
    user;
    tags;
    targetRoles;
}
exports.Announcement = Announcement;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement ID' }),
    __metadata("design:type", String)
], Announcement.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID of creator' }),
    __metadata("design:type", String)
], Announcement.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement title' }),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement content' }),
    __metadata("design:type", String)
], Announcement.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Announcement.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Announcement.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiration timestamp', required: false }),
    __metadata("design:type", String)
], Announcement.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Announcement type', required: false }),
    __metadata("design:type", String)
], Announcement.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visibility (public/private)',
        enum: ['public', 'private'],
    }),
    __metadata("design:type", String)
], Announcement.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creator user info', required: false }),
    __metadata("design:type", Object)
], Announcement.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tags associated with announcement',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Announcement.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target roles', type: 'array', required: false }),
    __metadata("design:type", Array)
], Announcement.prototype, "targetRoles", void 0);
//# sourceMappingURL=announcement.entity.js.map