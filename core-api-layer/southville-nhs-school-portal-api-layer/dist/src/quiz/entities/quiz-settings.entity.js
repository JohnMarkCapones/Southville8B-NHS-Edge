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
exports.QuizSettings = void 0;
const swagger_1 = require("@nestjs/swagger");
class QuizSettings {
    id;
    quiz_id;
    lockdown_browser;
    anti_screenshot;
    disable_copy_paste;
    disable_right_click;
    require_fullscreen;
    track_tab_switches;
    track_device_changes;
    track_ip_changes;
    tab_switch_warning_threshold;
    created_at;
}
exports.QuizSettings = QuizSettings;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Settings ID (UUID)' }),
    __metadata("design:type", String)
], QuizSettings.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz ID (UUID)' }),
    __metadata("design:type", String)
], QuizSettings.prototype, "quiz_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lockdown browser mode',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "lockdown_browser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Anti-screenshot warning',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "anti_screenshot", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Disable copy-paste',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "disable_copy_paste", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Disable right-click',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "disable_right_click", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Require fullscreen mode',
        default: false,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "require_fullscreen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Track tab switches',
        default: true,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "track_tab_switches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Track device changes',
        default: true,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "track_device_changes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Track IP changes',
        default: true,
    }),
    __metadata("design:type", Boolean)
], QuizSettings.prototype, "track_ip_changes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tab switch warning threshold',
        default: 3,
    }),
    __metadata("design:type", Number)
], QuizSettings.prototype, "tab_switch_warning_threshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], QuizSettings.prototype, "created_at", void 0);
//# sourceMappingURL=quiz-settings.entity.js.map