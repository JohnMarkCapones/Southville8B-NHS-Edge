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
exports.Faq = void 0;
const swagger_1 = require("@nestjs/swagger");
class Faq {
    id;
    question;
    answer;
    created_at;
    updated_at;
}
exports.Faq = Faq;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FAQ ID (UUID)' }),
    __metadata("design:type", String)
], Faq.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'FAQ question',
        example: 'How do I reset my password?',
    }),
    __metadata("design:type", String)
], Faq.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'FAQ answer',
        example: 'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.',
    }),
    __metadata("design:type", String)
], Faq.prototype, "answer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], Faq.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", String)
], Faq.prototype, "updated_at", void 0);
//# sourceMappingURL=faq.entity.js.map