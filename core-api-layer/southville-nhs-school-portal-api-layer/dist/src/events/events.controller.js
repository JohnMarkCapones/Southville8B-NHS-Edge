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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const create_event_dto_2 = require("./dto/create-event.dto");
const update_event_additional_info_dto_1 = require("./dto/update-event-additional-info.dto");
const create_event_dto_3 = require("./dto/create-event.dto");
const update_event_highlight_dto_1 = require("./dto/update-event-highlight.dto");
const create_event_dto_4 = require("./dto/create-event.dto");
const update_event_schedule_dto_1 = require("./dto/update-event-schedule.dto");
const create_event_dto_5 = require("./dto/create-event.dto");
const update_event_faq_dto_1 = require("./dto/update-event-faq.dto");
const reorder_event_items_dto_1 = require("./dto/reorder-event-items.dto");
const event_statistics_dto_1 = require("./dto/event-statistics.dto");
const tag_dto_1 = require("./dto/tag.dto");
const event_entity_1 = require("./entities/event.entity");
const event_additional_info_entity_1 = require("./entities/event-additional-info.entity");
const event_highlight_entity_1 = require("./entities/event-highlight.entity");
const event_schedule_entity_1 = require("./entities/event-schedule.entity");
const event_faq_entity_1 = require("./entities/event-faq.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const audit_interceptor_1 = require("./audit.interceptor");
const uuid_1 = require("uuid");
const path = require("path");
const r2_storage_service_1 = require("../storage/r2-storage/r2-storage.service");
let EventsController = EventsController_1 = class EventsController {
    eventsService;
    r2StorageService;
    logger = new common_1.Logger(EventsController_1.name);
    constructor(eventsService, r2StorageService) {
        this.eventsService = eventsService;
        this.r2StorageService = r2StorageService;
    }
    async enrichEventWithPresignedUrl(event) {
        if (!event.eventImage)
            return event;
        try {
            let fileKey = null;
            if (event.eventImage.startsWith('events/images/')) {
                fileKey = event.eventImage;
            }
            else if (event.eventImage.includes('/events/images/')) {
                const urlParts = event.eventImage.split('/events/images/');
                if (urlParts.length === 2) {
                    fileKey = `events/images/${urlParts[1]}`;
                }
            }
            if (fileKey) {
                this.logger.debug(`Converting image URL to presigned URL. Original: ${event.eventImage}, Key: ${fileKey}`);
                event.eventImage = await this.r2StorageService.getPresignedUrl(fileKey, 86400);
                this.logger.debug(`Generated presigned URL: ${event.eventImage}`);
            }
            else {
                this.logger.warn(`Could not extract file key from image URL: ${event.eventImage}`);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to generate presigned URL for ${event.eventImage}: ${error.message}`);
        }
        return event;
    }
    async create(createEventDto, user) {
        this.logger.log(`Creating event for user: ${user.id}`);
        return this.eventsService.create(createEventDto, user.id);
    }
    async findAll(page = 1, limit = 10, status, visibility, startDate, endDate, organizerId, tagId, search) {
        const filters = {
            page,
            limit,
            status,
            visibility,
            startDate,
            endDate,
            organizerId,
            tagId,
            search,
        };
        const result = await this.eventsService.findAll(filters);
        if (result && result.data) {
            for (const event of result.data) {
                await this.enrichEventWithPresignedUrl(event);
            }
        }
        return result;
    }
    async getStatistics() {
        return this.eventsService.getStatistics();
    }
    async getTags() {
        return this.eventsService.getTags();
    }
    async uploadImage(request, userId) {
        try {
            const parts = request.parts();
            let imageBuffer = null;
            let imageFilename = '';
            let imageMimeType = '';
            for await (const part of parts) {
                if (part.type === 'file' && part.fieldname === 'image') {
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    imageBuffer = Buffer.concat(chunks);
                    imageFilename = part.filename;
                    imageMimeType = part.mimetype;
                }
            }
            if (!imageBuffer || !imageFilename) {
                throw new common_1.BadRequestException('No image file provided');
            }
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            if (!allowedTypes.includes(imageMimeType)) {
                throw new common_1.BadRequestException('Invalid image type. Allowed: JPEG, PNG, GIF, WEBP');
            }
            const maxSize = 10 * 1024 * 1024;
            if (imageBuffer.length > maxSize) {
                throw new common_1.BadRequestException(`Image too large: ${(imageBuffer.length / (1024 * 1024)).toFixed(2)}MB. Maximum: 10MB`);
            }
            const ext = path.extname(imageFilename);
            const sanitizedName = imageFilename
                .replace(ext, '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 50);
            const uniqueId = (0, uuid_1.v4)();
            const finalFilename = `${uniqueId}-${sanitizedName}${ext}`;
            const fileKey = `events/images/${finalFilename}`;
            this.logger.debug(`Uploading image to R2: ${fileKey}`);
            const uploadResult = await this.r2StorageService.uploadFile(fileKey, imageBuffer, imageMimeType);
            if (!uploadResult.success) {
                this.logger.error(`R2 upload failed for ${fileKey}`);
                throw new common_1.BadRequestException('Failed to upload image to storage');
            }
            this.logger.log(`Image uploaded successfully: ${fileKey}`);
            this.logger.debug(`Upload result: ${JSON.stringify(uploadResult)}`);
            return {
                url: fileKey,
                fileName: imageFilename,
                fileSize: imageBuffer.length,
            };
        }
        catch (error) {
            this.logger.error('Error uploading image:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
    }
    async findUpcoming() {
        return this.eventsService.findUpcoming();
    }
    async findByOrganizer(organizerId, page = 1, limit = 10) {
        const filters = { page, limit };
        return this.eventsService.findByOrganizer(organizerId, filters);
    }
    async findOne(id) {
        const event = await this.eventsService.findOne(id);
        return this.enrichEventWithPresignedUrl(event);
    }
    async update(id, updateEventDto, user) {
        this.logger.log(`Updating event ${id} for user: ${user.id}`);
        return this.eventsService.update(id, updateEventDto, user.id, user.role);
    }
    async remove(id) {
        return this.eventsService.remove(id);
    }
    async addAdditionalInfo(eventId, dto) {
        return this.eventsService.addAdditionalInfo(eventId, dto);
    }
    async updateAdditionalInfo(eventId, infoId, dto) {
        return this.eventsService.updateAdditionalInfo(eventId, infoId, dto);
    }
    async removeAdditionalInfo(eventId, infoId) {
        return this.eventsService.removeAdditionalInfo(eventId, infoId);
    }
    async addHighlight(eventId, dto) {
        return this.eventsService.addHighlight(eventId, dto);
    }
    async updateHighlight(eventId, highlightId, dto) {
        return this.eventsService.updateHighlight(eventId, highlightId, dto);
    }
    async removeHighlight(eventId, highlightId) {
        return this.eventsService.removeHighlight(eventId, highlightId);
    }
    async addScheduleItem(eventId, dto) {
        return this.eventsService.addScheduleItem(eventId, dto);
    }
    async updateScheduleItem(eventId, scheduleId, dto) {
        return this.eventsService.updateScheduleItem(eventId, scheduleId, dto);
    }
    async removeScheduleItem(eventId, scheduleId) {
        return this.eventsService.removeScheduleItem(eventId, scheduleId);
    }
    async addFaq(eventId, dto) {
        return this.eventsService.addFaq(eventId, dto);
    }
    async updateFaq(eventId, faqId, dto) {
        return this.eventsService.updateFaq(eventId, faqId, dto);
    }
    async removeFaq(eventId, faqId) {
        return this.eventsService.removeFaq(eventId, faqId);
    }
    async reorderItems(eventId, entityType, dto) {
        return this.eventsService.reorderItems(eventId, entityType, dto);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event (Admin/Teacher only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Event created successfully',
        type: event_entity_1.Event,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all events with pagination and filtering',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        description: 'Filter by event status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'visibility',
        required: false,
        enum: ['public', 'private'],
        description: 'Filter by visibility',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Filter events from this date (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Filter events until this date (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'organizerId',
        required: false,
        type: String,
        description: 'Filter by organizer ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tagId',
        required: false,
        type: String,
        description: 'Filter by tag ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search in title and description',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Events retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('visibility')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('organizerId')),
    __param(7, (0, common_1.Query)('tagId')),
    __param(8, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event statistics and KPIs' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event statistics retrieved successfully',
        type: event_statistics_dto_1.EventStatisticsDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all event tags' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event tags retrieved successfully',
        type: [tag_dto_1.TagDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getTags", null);
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload event image to R2 storage' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Image uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    example: 'https://pub-xxx.r2.dev/events/images/uuid-image.jpg',
                },
                fileName: { type: 'string' },
                fileSize: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid image file' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming events' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Upcoming events retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Get)('organizer/:organizerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get events by organizer' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Organizer events retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('organizerId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findByOrganizer", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event retrieved successfully',
        type: event_entity_1.Event,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event (Admin or organizer)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event updated successfully',
        type: event_entity_1.Event,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only update own events',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete event (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Event deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/additional-info'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add additional info to event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Additional info added successfully',
        type: event_additional_info_entity_1.EventAdditionalInfo,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_2.CreateEventAdditionalInfoDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "addAdditionalInfo", null);
__decorate([
    (0, common_1.Patch)(':id/additional-info/:infoId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update additional info' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Additional info updated successfully',
        type: event_additional_info_entity_1.EventAdditionalInfo,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or info not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('infoId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_additional_info_dto_1.UpdateEventAdditionalInfoDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateAdditionalInfo", null);
__decorate([
    (0, common_1.Delete)(':id/additional-info/:infoId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove additional info' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Additional info removed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or info not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('infoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeAdditionalInfo", null);
__decorate([
    (0, common_1.Post)(':id/highlights'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add highlight to event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Highlight added successfully',
        type: event_highlight_entity_1.EventHighlight,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_3.CreateEventHighlightDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "addHighlight", null);
__decorate([
    (0, common_1.Patch)(':id/highlights/:highlightId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update highlight' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Highlight updated successfully',
        type: event_highlight_entity_1.EventHighlight,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or highlight not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('highlightId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_highlight_dto_1.UpdateEventHighlightDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateHighlight", null);
__decorate([
    (0, common_1.Delete)(':id/highlights/:highlightId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove highlight' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Highlight removed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or highlight not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('highlightId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeHighlight", null);
__decorate([
    (0, common_1.Post)(':id/schedule'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add schedule item to event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Schedule item added successfully',
        type: event_schedule_entity_1.EventSchedule,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_4.CreateEventScheduleDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "addScheduleItem", null);
__decorate([
    (0, common_1.Patch)(':id/schedule/:scheduleId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update schedule item' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule item updated successfully',
        type: event_schedule_entity_1.EventSchedule,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or schedule item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('scheduleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_schedule_dto_1.UpdateEventScheduleDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateScheduleItem", null);
__decorate([
    (0, common_1.Delete)(':id/schedule/:scheduleId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove schedule item' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule item removed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or schedule item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('scheduleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeScheduleItem", null);
__decorate([
    (0, common_1.Post)(':id/faq'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add FAQ to event' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'FAQ added successfully',
        type: event_faq_entity_1.EventFaq,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_5.CreateEventFaqDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "addFaq", null);
__decorate([
    (0, common_1.Patch)(':id/faq/:faqId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update FAQ' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ updated successfully',
        type: event_faq_entity_1.EventFaq,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or FAQ not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('faqId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_faq_dto_1.UpdateEventFaqDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateFaq", null);
__decorate([
    (0, common_1.Delete)(':id/faq/:faqId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove FAQ' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ removed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event or FAQ not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('faqId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeFaq", null);
__decorate([
    (0, common_1.Patch)(':id/reorder/:entityType'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder event items' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Items reordered successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Event not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, reorder_event_items_dto_1.ReorderEventItemsDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "reorderItems", null);
exports.EventsController = EventsController = EventsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, common_1.Controller)('events'),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        r2_storage_service_1.R2StorageService])
], EventsController);
//# sourceMappingURL=events.controller.js.map