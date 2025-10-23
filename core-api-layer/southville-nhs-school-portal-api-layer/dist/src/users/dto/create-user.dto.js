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
exports.CreateUserDto = exports.UserType = exports.UserRole = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "Admin";
    UserRole["TEACHER"] = "Teacher";
    UserRole["STUDENT"] = "Student";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserType;
(function (UserType) {
    UserType["TEACHER"] = "teacher";
    UserType["ADMIN"] = "admin";
    UserType["STUDENT"] = "student";
})(UserType || (exports.UserType = UserType = {}));
class CreateUserDto {
    email;
    fullName;
    role;
    userType;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        example: 'john.doe@school.edu',
        description: 'User email address',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'John Doe',
        description: 'Full name of the user',
        minLength: 2,
        maxLength: 100,
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(UserRole),
    (0, swagger_1.ApiProperty)({
        enum: UserRole,
        example: UserRole.TEACHER,
        description: 'User role',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(UserType),
    (0, swagger_1.ApiProperty)({
        enum: UserType,
        example: UserType.TEACHER,
        description: 'User type',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userType", void 0);
//# sourceMappingURL=create-user.dto.js.map