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
exports.CreateAdminDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("./create-user.dto");
class CreateAdminDto extends create_user_dto_1.CreateUserDto {
    birthday;
    roleDescription;
    phoneNumber;
    constructor() {
        super();
        this.role = create_user_dto_1.UserRole.ADMIN;
        this.userType = create_user_dto_1.UserType.ADMIN;
    }
}
exports.CreateAdminDto = CreateAdminDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '1980-03-20',
        description: 'Birthday',
        type: 'string',
        format: 'date',
    }),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "birthday", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'System Administrator',
        description: 'Role description',
        required: false,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "roleDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(15),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid international format',
    }),
    (0, swagger_1.ApiProperty)({
        example: '+1234567890',
        description: 'Phone number in international format',
        required: false,
        minLength: 10,
        maxLength: 15,
    }),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "phoneNumber", void 0);
//# sourceMappingURL=create-admin.dto.js.map