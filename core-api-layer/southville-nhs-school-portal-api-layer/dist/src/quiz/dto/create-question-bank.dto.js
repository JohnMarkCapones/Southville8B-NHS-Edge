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
exports.CreateQuestionBankDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateQuestionBankDto {
    questionText;
    questionType;
    subjectId;
    topic;
    difficulty;
    tags;
    defaultPoints;
    choices;
    correctAnswer;
    allowPartialCredit;
    timeLimitSeconds;
}
exports.CreateQuestionBankDto = CreateQuestionBankDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, swagger_1.ApiProperty)({
        example: 'What is the capital of France?',
        description: 'Question text',
        minLength: 3,
    }),
    __metadata("design:type", String)
], CreateQuestionBankDto.prototype, "questionText", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([
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
    ]),
    (0, swagger_1.ApiProperty)({
        example: 'multiple_choice',
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
], CreateQuestionBankDto.prototype, "questionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Subject ID',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuestionBankDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Geography',
        description: 'Topic name',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuestionBankDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['easy', 'medium', 'hard']),
    (0, swagger_1.ApiProperty)({
        example: 'medium',
        description: 'Difficulty level',
        enum: ['easy', 'medium', 'hard'],
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuestionBankDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, swagger_1.ApiProperty)({
        example: ['geography', 'capitals', 'europe'],
        description: 'Tags for categorization',
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], CreateQuestionBankDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Default points for this question',
        default: 1,
        required: false,
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateQuestionBankDto.prototype, "defaultPoints", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: [
            { text: 'Paris', is_correct: true },
            { text: 'London', is_correct: false },
        ],
        description: 'Choices in JSONB format',
        required: false,
    }),
    __metadata("design:type", Object)
], CreateQuestionBankDto.prototype, "choices", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: { answer: 'Paris' },
        description: 'Correct answer in JSONB format (for complex types)',
        required: false,
    }),
    __metadata("design:type", Object)
], CreateQuestionBankDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Allow partial credit',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuestionBankDto.prototype, "allowPartialCredit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 60,
        description: 'Time limit in seconds',
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuestionBankDto.prototype, "timeLimitSeconds", void 0);
//# sourceMappingURL=create-question-bank.dto.js.map