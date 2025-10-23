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
exports.CreateClubFormDto = exports.FormType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FormType;
(function (FormType) {
    FormType["MEMBER_REGISTRATION"] = "member_registration";
    FormType["TEACHER_APPLICATION"] = "teacher_application";
    FormType["EVENT_SIGNUP"] = "event_signup";
    FormType["SURVEY"] = "survey";
    FormType["FEEDBACK"] = "feedback";
})(FormType || (exports.FormType = FormType = {}));
class CreateClubFormDto {
    name;
    description;
    is_active;
    auto_approve;
    form_type;
}
exports.CreateClubFormDto = CreateClubFormDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Form name',
        example: 'Member Registration Form',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateClubFormDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Form description',
        example: 'Register to become a member of our club',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubFormDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the form is active',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateClubFormDto.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether responses should be auto-approved',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateClubFormDto.prototype, "auto_approve", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of form',
        example: 'member_registration',
        enum: FormType,
        default: FormType.MEMBER_REGISTRATION,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FormType),
    __metadata("design:type", String)
], CreateClubFormDto.prototype, "form_type", void 0);
//# sourceMappingURL=create-club-form.dto.js.map