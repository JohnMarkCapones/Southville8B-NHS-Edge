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
exports.CreateQuizSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateQuizSettingsDto {
    lockdownBrowser;
    antiScreenshot;
    disableCopyPaste;
    disableRightClick;
    requireFullscreen;
    trackTabSwitches;
    trackDeviceChanges;
    trackIpChanges;
    tabSwitchWarningThreshold;
}
exports.CreateQuizSettingsDto = CreateQuizSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Enable lockdown browser mode',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "lockdownBrowser", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Enable anti-screenshot warning',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "antiScreenshot", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Disable copy-paste during quiz',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "disableCopyPaste", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Disable right-click during quiz',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "disableRightClick", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Require fullscreen mode during quiz',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "requireFullscreen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Track tab switches',
        default: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "trackTabSwitches", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Track device changes',
        default: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "trackDeviceChanges", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Track IP address changes',
        default: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizSettingsDto.prototype, "trackIpChanges", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 3,
        description: 'Number of tab switches before warning',
        default: 3,
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuizSettingsDto.prototype, "tabSwitchWarningThreshold", void 0);
//# sourceMappingURL=create-quiz-settings.dto.js.map