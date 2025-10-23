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
exports.QuestionBank = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuestionBank {
    id;
    teacher_id;
    question_text;
    question_type;
    subject_id;
    topic;
    difficulty;
    tags;
    default_points;
    choices;
    correct_answer;
    allow_partial_credit;
    time_limit_seconds;
    created_at;
    updated_at;
}
exports.QuestionBank = QuestionBank;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question ID (UUID)' }),
    __metadata("design:type", String)
], QuestionBank.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher ID (UUID)' }),
    __metadata("design:type", String)
], QuestionBank.prototype, "teacher_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Question text' }),
    __metadata("design:type", String)
], QuestionBank.prototype, "question_text", void 0);
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
], QuestionBank.prototype, "question_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject ID (UUID)', required: false }),
    __metadata("design:type", String)
], QuestionBank.prototype, "subject_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Topic', required: false }),
    __metadata("design:type", String)
], QuestionBank.prototype, "topic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Difficulty level',
        enum: ['easy', 'medium', 'hard'],
        required: false,
    }),
    __metadata("design:type", String)
], QuestionBank.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tags', type: [String], required: false }),
    __metadata("design:type", Array)
], QuestionBank.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default points', default: 1 }),
    __metadata("design:type", Number)
], QuestionBank.prototype, "default_points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Choices (JSONB)', required: false }),
    __metadata("design:type", Object)
], QuestionBank.prototype, "choices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Correct answer (JSONB)', required: false }),
    __metadata("design:type", Object)
], QuestionBank.prototype, "correct_answer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allow partial credit', default: false }),
    __metadata("design:type", Boolean)
], QuestionBank.prototype, "allow_partial_credit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time limit in seconds',
        required: false,
    }),
    __metadata("design:type", Number)
], QuestionBank.prototype, "time_limit_seconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], QuestionBank.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", String)
], QuestionBank.prototype, "updated_at", void 0);
//# sourceMappingURL=question-bank.entity.js.map