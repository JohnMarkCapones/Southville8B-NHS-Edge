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
exports.ImportUsersDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
let ValidDataUriConstraint = class ValidDataUriConstraint {
    validate(value, args) {
        if (!value)
            return false;
        const dataUriPattern = /^data:([^;]+);base64,([A-Za-z0-9+/]+=*)$/;
        const match = value.match(dataUriPattern);
        if (!match)
            return false;
        const [, mimeType, base64Data] = match;
        const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
        if (!allowedMimeTypes.includes(mimeType))
            return false;
        const decodedSize = Buffer.byteLength(base64Data, 'base64');
        const maxSize = 5 * 1024 * 1024;
        return decodedSize <= maxSize;
    }
    defaultMessage(args) {
        return 'File must be a valid CSV data URI (text/csv, application/csv, or text/plain) with base64 encoding and maximum size of 5MB';
    }
};
ValidDataUriConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'validDataUri', async: false })
], ValidDataUriConstraint);
class ImportUsersDto {
    file;
}
exports.ImportUsersDto = ImportUsersDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(ValidDataUriConstraint),
    (0, swagger_1.ApiProperty)({
        description: 'CSV file content as base64 data URI',
        example: 'data:text/csv;base64,Zmlyc3ROYW1lLGxhc3ROYW1lLGVtYWlsLGJpcnRoZGF5CkpvaG4sRG9lLGpvaG4uZG9lQHNjaG9vbC5lZHUsMTk4NS0wNS0xNQ==',
    }),
    __metadata("design:type", String)
], ImportUsersDto.prototype, "file", void 0);
//# sourceMappingURL=import-users.dto.js.map