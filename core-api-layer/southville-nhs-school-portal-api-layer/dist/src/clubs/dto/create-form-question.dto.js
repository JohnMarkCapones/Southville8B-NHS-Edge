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
exports.CreateFormQuestionDto = exports.CreateQuestionOptionDto = exports.QuestionType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const is_options_required_for_type_validator_1 = require("./validators/is-options-required-for-type.validator");
var QuestionType;
(function (QuestionType) {
    QuestionType["TEXT"] = "text";
    QuestionType["TEXTAREA"] = "textarea";
    QuestionType["DROPDOWN"] = "dropdown";
    QuestionType["RADIO"] = "radio";
    QuestionType["CHECKBOX"] = "checkbox";
    QuestionType["NUMBER"] = "number";
    QuestionType["EMAIL"] = "email";
    QuestionType["DATE"] = "date";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
class CreateQuestionOptionDto {
    option_text;
    option_value;
    order_index;
}
exports.CreateQuestionOptionDto = CreateQuestionOptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option display text',
        example: 'Grade 7',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionOptionDto.prototype, "option_text", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Option value',
        example: 'grade_7',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionOptionDto.prototype, "option_value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order index for sorting',
        example: 0,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateQuestionOptionDto.prototype, "order_index", void 0);
class CreateFormQuestionDto {
    question_text;
    question_type;
    required;
    order_index;
    options;
}
exports.CreateFormQuestionDto = CreateFormQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question text',
        example: 'What is your grade level?',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormQuestionDto.prototype, "question_text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of question',
        example: 'dropdown',
        enum: QuestionType,
        default: QuestionType.TEXT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(QuestionType),
    __metadata("design:type", String)
], CreateFormQuestionDto.prototype, "question_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the question is required',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFormQuestionDto.prototype, "required", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order index for sorting',
        example: 0,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFormQuestionDto.prototype, "order_index", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Options for dropdown/radio/checkbox questions',
        type: [CreateQuestionOptionDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateQuestionOptionDto),
    (0, is_options_required_for_type_validator_1.IsOptionsRequiredForType)(),
    __metadata("design:type", Array)
], CreateFormQuestionDto.prototype, "options", void 0);
//# sourceMappingURL=create-form-question.dto.js.map