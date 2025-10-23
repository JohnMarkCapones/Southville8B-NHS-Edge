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
exports.Location = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_location_dto_1 = require("../dto/create-location.dto");
class Location {
    id;
    name;
    description;
    image_type;
    image_url;
    preview_image_url;
    created_at;
    hotspots;
}
exports.Location = Location;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location ID (UUID)' }),
    __metadata("design:type", String)
], Location.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location name',
        example: 'Main Library',
    }),
    __metadata("design:type", String)
], Location.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location description',
        example: 'The main library building with study areas and computer labs',
        required: false,
    }),
    __metadata("design:type", String)
], Location.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of image for the location',
        enum: create_location_dto_1.ImageType,
        example: create_location_dto_1.ImageType.PANORAMIC,
    }),
    __metadata("design:type", String)
], Location.prototype, "image_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to the main location image',
        example: 'https://project.supabase.co/storage/v1/object/public/locations/library-main.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], Location.prototype, "image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to the preview thumbnail image',
        example: 'https://project.supabase.co/storage/v1/object/public/locations/library-preview.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], Location.prototype, "preview_image_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], Location.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hotspots for this location',
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                x_position: { type: 'number' },
                y_position: { type: 'number' },
                link_to_location_id: { type: 'string', nullable: true },
                created_at: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Array)
], Location.prototype, "hotspots", void 0);
//# sourceMappingURL=location.entity.js.map