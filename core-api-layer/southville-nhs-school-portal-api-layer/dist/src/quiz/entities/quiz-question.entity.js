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
exports.QuizQuestion = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuizQuestion {
    question_id;
    quiz_id;
    question_text;
    question_type;
    order_index;
    points;
    allow_partial_credit;
    time_limit_seconds;
    is_pool_question;
    source_question_bank_id;
    created_at;
    updated_at;
}
exports.QuizQuestion = QuizQuestion;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question ID (UUID)' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "question_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz ID (UUID)' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "quiz_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question text' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "question_text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question type',
        enum: [
            'multiple_choice',
            'checkbox',
            'true_false',
            'short_answer',
            'essay',
            'fill_in_blank',
            'matching',
            'drag_drop',
            'ordering',
            'dropdown',
            'linear_scale',
        ],
    }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "question_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order index' }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "order_index", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Points for this question', default: 1 }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allow partial credit', default: false }),
    __metadata("design:type", Boolean)
], QuizQuestion.prototype, "allow_partial_credit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time limit in seconds for this question',
        required: false,
    }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "time_limit_seconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Is this question part of a randomization pool',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizQuestion.prototype, "is_pool_question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Source question bank ID if imported (UUID)',
        required: false,
    }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "source_question_bank_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "updated_at", void 0);
//# sourceMappingURL=quiz-question.entity.js.map