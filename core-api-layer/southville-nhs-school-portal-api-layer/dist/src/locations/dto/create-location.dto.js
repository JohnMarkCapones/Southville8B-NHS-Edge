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
exports.CreateLocationDto = exports.ImageType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("../../common");
var ImageType;
(function (ImageType) {
    ImageType["PANORAMIC"] = "panoramic";
    ImageType["REGULAR"] = "regular";
})(ImageType || (exports.ImageType = ImageType = {}));
class CreateLocationDto {
    name;
    description;
    imageType;
    imageUrl;
    previewImageUrl;
}
exports.CreateLocationDto = CreateLocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        description: 'Location name',
        example: 'Main Library',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, swagger_1.ApiProperty)({
        description: 'Location description',
        example: 'The main library building with study areas and computer labs',
        required: false,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ImageType),
    (0, swagger_1.ApiProperty)({
        description: 'Type of image for the location',
        enum: ImageType,
        example: ImageType.PANORAMIC,
    }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "imageType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, common_1.IsSafeUrl)(),
    (0, swagger_1.ApiProperty)({
        description: 'URL to the main location image',
        example: 'https://project.supabase.co/storage/v1/object/public/locations/library-main.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, common_1.IsSafeUrl)(),
    (0, swagger_1.ApiProperty)({
        description: 'URL to the preview thumbnail image',
        example: 'https://project.supabase.co/storage/v1/object/public/locations/library-preview.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], CreateLocationDto.prototype, "previewImageUrl", void 0);
//# sourceMappingURL=create-location.dto.js.map