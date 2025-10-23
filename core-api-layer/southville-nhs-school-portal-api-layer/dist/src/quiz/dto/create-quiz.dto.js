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
exports.CreateQuizDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateQuizDto {
    title;
    description;
    subjectId;
    type;
    gradingType;
    timeLimit;
    startDate;
    endDate;
    visibility;
    questionPoolSize;
    questionsToDisplay;
    allowRetakes;
    allowBacktracking;
    shuffleQuestions;
    shuffleChoices;
    totalPoints;
    passingScore;
}
exports.CreateQuizDto = CreateQuizDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Math Quiz - Algebra Basics',
        description: 'Quiz title',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    (0, swagger_1.ApiProperty)({
        example: 'This quiz covers basic algebra concepts including equations and inequalities',
        description: 'Quiz description',
        required: false,
        maxLength: 1000,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Subject ID (UUID)',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['form', 'sequential', 'mixed']),
    (0, swagger_1.ApiProperty)({
        example: 'form',
        description: 'Quiz type',
        enum: ['form', 'sequential', 'mixed'],
        default: 'form',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['auto', 'manual', 'hybrid']),
    (0, swagger_1.ApiProperty)({
        example: 'auto',
        description: 'Grading type',
        enum: ['auto', 'manual', 'hybrid'],
        default: 'auto',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "gradingType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 60,
        description: 'Time limit in minutes',
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "timeLimit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-20T10:00:00Z',
        description: 'Quiz start date (ISO 8601 format)',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-27T18:00:00Z',
        description: 'Quiz end date (ISO 8601 format)',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['public', 'section_only']),
    (0, swagger_1.ApiProperty)({
        example: 'section_only',
        description: 'Quiz visibility',
        enum: ['public', 'section_only'],
        default: 'section_only',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Total questions in pool (for question randomization)',
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "questionPoolSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.ValidateIf)((o) => o.questionPoolSize),
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Number of questions to display per attempt (must be <= questionPoolSize)',
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "questionsToDisplay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Allow students to retake the quiz',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "allowRetakes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Allow students to navigate back to previous questions',
        default: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "allowBacktracking", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Shuffle questions for each attempt',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "shuffleQuestions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Shuffle answer choices for each attempt',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizDto.prototype, "shuffleChoices", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Total points for the quiz',
        required: false,
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "totalPoints", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 75,
        description: 'Passing score threshold',
        required: false,
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "passingScore", void 0);
//# sourceMappingURL=create-quiz.dto.js.map