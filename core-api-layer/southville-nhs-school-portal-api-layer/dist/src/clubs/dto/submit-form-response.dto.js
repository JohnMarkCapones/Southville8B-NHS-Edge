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
exports.SubmitFormResponseDto = exports.FormAnswerDto = exports.ResponseStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["PENDING"] = "pending";
    ResponseStatus["APPROVED"] = "approved";
    ResponseStatus["REJECTED"] = "rejected";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
class FormAnswerDto {
    question_id;
    answer_text;
    answer_value;
}
exports.FormAnswerDto = FormAnswerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FormAnswerDto.prototype, "question_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Answer text',
        example: 'I want to join because I love science',
    }),
    (0, class_validator_1.ValidateIf)((o) => !o.answer_value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: 'Either answer_text or answer_value must be provided',
    }),
    __metadata("design:type", String)
], FormAnswerDto.prototype, "answer_text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Answer value (for dropdown/radio/checkbox)',
        example: 'grade_7',
    }),
    (0, class_validator_1.ValidateIf)((o) => !o.answer_text),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: 'Either answer_text or answer_value must be provided',
    }),
    __metadata("design:type", String)
], FormAnswerDto.prototype, "answer_value", void 0);
class SubmitFormResponseDto {
    answers;
}
exports.SubmitFormResponseDto = SubmitFormResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of answers to form questions',
        type: [FormAnswerDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FormAnswerDto),
    __metadata("design:type", Array)
], SubmitFormResponseDto.prototype, "answers", void 0);
//# sourceMappingURL=submit-form-response.dto.js.map