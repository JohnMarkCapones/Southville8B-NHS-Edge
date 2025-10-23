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
exports.Quiz = void 0;
const swagger_1 = require("@nestjs/swagger");
class Quiz {
    quiz_id;
    title;
    description;
    subject_id;
    teacher_id;
    type;
    grading_type;
    time_limit;
    start_date;
    end_date;
    status;
    version;
    parent_quiz_id;
    visibility;
    question_pool_size;
    questions_to_display;
    allow_retakes;
    allow_backtracking;
    shuffle_questions;
    shuffle_choices;
    total_points;
    passing_score;
    created_at;
    updated_at;
}
exports.Quiz = Quiz;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz ID (UUID)' }),
    __metadata("design:type", String)
], Quiz.prototype, "quiz_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz title' }),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz description', required: false }),
    __metadata("design:type", String)
], Quiz.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject ID (UUID)', required: false }),
    __metadata("design:type", String)
], Quiz.prototype, "subject_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher ID (UUID)' }),
    __metadata("design:type", String)
], Quiz.prototype, "teacher_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz type',
        enum: ['form', 'sequential', 'mixed'],
        default: 'form',
    }),
    __metadata("design:type", String)
], Quiz.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Grading type',
        enum: ['auto', 'manual', 'hybrid'],
        default: 'auto',
    }),
    __metadata("design:type", String)
], Quiz.prototype, "grading_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time limit in minutes',
        required: false,
    }),
    __metadata("design:type", Number)
], Quiz.prototype, "time_limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz start date (ISO 8601)',
        required: false,
    }),
    __metadata("design:type", String)
], Quiz.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz end date (ISO 8601)',
        required: false,
    }),
    __metadata("design:type", String)
], Quiz.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quiz status',
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft',
    }),
    __metadata("design:type", String)
], Quiz.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz version number', default: 1 }),
    __metadata("design:type", Number)
], Quiz.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Parent quiz ID for versioning (UUID)',
        required: false,
    }),
    __metadata("design:type", String)
], Quiz.prototype, "parent_quiz_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Visibility setting',
        enum: ['public', 'section_only'],
        default: 'section_only',
    }),
    __metadata("design:type", String)
], Quiz.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total questions in pool',
        required: false,
    }),
    __metadata("design:type", Number)
], Quiz.prototype, "question_pool_size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Questions to display per attempt',
        required: false,
    }),
    __metadata("design:type", Number)
], Quiz.prototype, "questions_to_display", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allow retakes', default: false }),
    __metadata("design:type", Boolean)
], Quiz.prototype, "allow_retakes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Allow backtracking', default: true }),
    __metadata("design:type", Boolean)
], Quiz.prototype, "allow_backtracking", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shuffle questions', default: false }),
    __metadata("design:type", Boolean)
], Quiz.prototype, "shuffle_questions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shuffle choices', default: false }),
    __metadata("design:type", Boolean)
], Quiz.prototype, "shuffle_choices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total points', required: false }),
    __metadata("design:type", Number)
], Quiz.prototype, "total_points", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Passing score', required: false }),
    __metadata("design:type", Number)
], Quiz.prototype, "passing_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], Quiz.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", String)
], Quiz.prototype, "updated_at", void 0);
//# sourceMappingURL=quiz.entity.js.map