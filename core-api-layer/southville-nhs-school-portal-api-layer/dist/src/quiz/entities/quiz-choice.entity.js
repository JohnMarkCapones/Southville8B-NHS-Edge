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
exports.QuizChoice = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuizChoice {
    choice_id;
    question_id;
    choice_text;
    is_correct;
    order_index;
    metadata;
    created_at;
}
exports.QuizChoice = QuizChoice;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Choice ID (UUID)' }),
    __metadata("design:type", String)
], QuizChoice.prototype, "choice_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question ID (UUID)' }),
    __metadata("design:type", String)
], QuizChoice.prototype, "question_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Choice text' }),
    __metadata("design:type", String)
], QuizChoice.prototype, "choice_text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is this the correct answer', default: false }),
    __metadata("design:type", Boolean)
], QuizChoice.prototype, "is_correct", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order index', required: false }),
    __metadata("design:type", Number)
], QuizChoice.prototype, "order_index", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional metadata for complex question types',
        required: false,
    }),
    __metadata("design:type", Object)
], QuizChoice.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], QuizChoice.prototype, "created_at", void 0);
//# sourceMappingURL=quiz-choice.entity.js.map