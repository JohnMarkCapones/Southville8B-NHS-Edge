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
exports.QuizAttempt = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuizAttempt {
    attempt_id;
    quiz_id;
    student_id;
    attempt_number;
    score;
    max_possible_score;
    status;
    terminated_by_teacher;
    termination_reason;
    started_at;
    submitted_at;
    time_taken_seconds;
    questions_shown;
    created_at;
}
exports.QuizAttempt = QuizAttempt;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attempt ID (UUID)' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "attempt_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz ID (UUID)' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "quiz_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID (UUID)' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "student_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Attempt number' }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "attempt_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Score achieved', required: false }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum possible score', required: false }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "max_possible_score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Attempt status',
        enum: ['in_progress', 'submitted', 'graded', 'terminated'],
        default: 'in_progress',
    }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Was terminated by teacher',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizAttempt.prototype, "terminated_by_teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Termination reason',
        required: false,
    }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "termination_reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Started at timestamp' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "started_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Submitted at timestamp', required: false }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "submitted_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Time taken in seconds',
        required: false,
    }),
    __metadata("design:type", Number)
], QuizAttempt.prototype, "time_taken_seconds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Questions shown (array of UUIDs)',
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], QuizAttempt.prototype, "questions_shown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], QuizAttempt.prototype, "created_at", void 0);
//# sourceMappingURL=quiz-attempt.entity.js.map