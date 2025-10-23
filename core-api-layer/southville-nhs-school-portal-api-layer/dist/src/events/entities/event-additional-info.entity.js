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
exports.EventAdditionalInfo = void 0;
const swagger_1 = require("@nestjs/swagger");
class EventAdditionalInfo {
    id;
    eventId;
    title;
    content;
    orderIndex;
    createdAt;
}
exports.EventAdditionalInfo = EventAdditionalInfo;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional info ID' }),
    __metadata("design:type", String)
], EventAdditionalInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID' }),
    __metadata("design:type", String)
], EventAdditionalInfo.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Info section title' }),
    __metadata("design:type", String)
], EventAdditionalInfo.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Info section content' }),
    __metadata("design:type", String)
], EventAdditionalInfo.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display order index' }),
    __metadata("design:type", Number)
], EventAdditionalInfo.prototype, "orderIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], EventAdditionalInfo.prototype, "createdAt", void 0);
//# sourceMappingURL=event-additional-info.entity.js.map