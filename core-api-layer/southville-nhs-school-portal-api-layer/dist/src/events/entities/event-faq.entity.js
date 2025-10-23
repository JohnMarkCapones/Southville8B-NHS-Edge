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
exports.EventFaq = void 0;
const swagger_1 = require("@nestjs/swagger");
class EventFaq {
    id;
    eventId;
    question;
    answer;
    createdAt;
}
exports.EventFaq = EventFaq;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FAQ ID' }),
    __metadata("design:type", String)
], EventFaq.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID' }),
    __metadata("design:type", String)
], EventFaq.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FAQ question' }),
    __metadata("design:type", String)
], EventFaq.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FAQ answer' }),
    __metadata("design:type", String)
], EventFaq.prototype, "answer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], EventFaq.prototype, "createdAt", void 0);
//# sourceMappingURL=event-faq.entity.js.map