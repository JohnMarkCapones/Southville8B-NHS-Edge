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
exports.SuspendUserDto = exports.UpdateUserStatusDto = exports.UserStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let AtLeastOneSuspensionFieldConstraint = class AtLeastOneSuspensionFieldConstraint {
    validate(value, args) {
        const object = args.object;
        return !!(object.duration || object.suspendedUntil);
    }
    defaultMessage(args) {
        return 'Either duration or suspendedUntil must be provided';
    }
};
AtLeastOneSuspensionFieldConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'atLeastOneSuspensionField', async: false })
], AtLeastOneSuspensionFieldConstraint);
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "Active";
    UserStatus["INACTIVE"] = "Inactive";
    UserStatus["SUSPENDED"] = "Suspended";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
class UpdateUserStatusDto {
    status;
    reason;
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(UserStatus),
    (0, swagger_1.ApiProperty)({
        enum: UserStatus,
        example: UserStatus.ACTIVE,
        description: 'New user status',
    }),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Reason for status change',
    }),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "reason", void 0);
class SuspendUserDto {
    reason;
    duration;
    suspendedUntil;
    _validateSuspensionFields;
}
exports.SuspendUserDto = SuspendUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: 'Reason for suspension',
        example: 'Violation of school policies',
    }),
    __metadata("design:type", String)
], SuspendUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.suspendedUntil),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(365),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Suspension duration in days',
        example: 30,
        minimum: 1,
        maximum: 365,
    }),
    __metadata("design:type", Number)
], SuspendUserDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.duration),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Suspension end date (ISO format)',
        example: '2024-12-31',
    }),
    __metadata("design:type", String)
], SuspendUserDto.prototype, "suspendedUntil", void 0);
__decorate([
    (0, class_validator_1.Validate)(AtLeastOneSuspensionFieldConstraint),
    __metadata("design:type", Object)
], SuspendUserDto.prototype, "_validateSuspensionFields", void 0);
//# sourceMappingURL=update-user-status.dto.js.map