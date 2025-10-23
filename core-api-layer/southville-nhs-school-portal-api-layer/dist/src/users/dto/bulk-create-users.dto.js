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
exports.BulkCreateUsersDto = exports.BulkUserDto = exports.UserType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var UserType;
(function (UserType) {
    UserType["TEACHER"] = "teacher";
    UserType["ADMIN"] = "admin";
    UserType["STUDENT"] = "student";
})(UserType || (exports.UserType = UserType = {}));
class BulkUserDto {
    userType;
    data;
}
exports.BulkUserDto = BulkUserDto;
__decorate([
    (0, class_validator_1.IsEnum)(UserType),
    (0, swagger_1.ApiProperty)({
        enum: UserType,
        description: 'Type of user to create',
        example: UserType.TEACHER,
    }),
    __metadata("design:type", String)
], BulkUserDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User data based on userType',
        example: {
            email: 'john.doe@school.edu',
            fullName: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            birthday: '1985-05-15',
        },
    }),
    __metadata("design:type", Object)
], BulkUserDto.prototype, "data", void 0);
class BulkCreateUsersDto {
    users;
}
exports.BulkCreateUsersDto = BulkCreateUsersDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_transformer_1.Type)(() => BulkUserDto),
    (0, swagger_1.ApiProperty)({
        description: 'Array of users to create (max 100)',
        type: [BulkUserDto],
        minItems: 1,
        maxItems: 100,
        example: [
            {
                userType: 'teacher',
                data: {
                    email: 'john.doe@school.edu',
                    fullName: 'John Doe',
                    firstName: 'John',
                    lastName: 'Doe',
                    birthday: '1985-05-15',
                },
            },
            {
                userType: 'student',
                data: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    studentId: 'STU-2024-002',
                    lrnId: '123456789013',
                    birthday: '2008-03-20',
                    gradeLevel: 'Grade 10',
                    enrollmentYear: 2024,
                },
            },
        ],
    }),
    __metadata("design:type", Array)
], BulkCreateUsersDto.prototype, "users", void 0);
//# sourceMappingURL=bulk-create-users.dto.js.map