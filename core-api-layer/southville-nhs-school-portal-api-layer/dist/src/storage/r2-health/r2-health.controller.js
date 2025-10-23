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
exports.R2HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const r2_storage_service_1 = require("../r2-storage/r2-storage.service");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const roles_decorator_2 = require("../../auth/decorators/roles.decorator");
let R2HealthController = class R2HealthController {
    r2StorageService;
    constructor(r2StorageService) {
        this.r2StorageService = r2StorageService;
    }
    async getConnectionStatus() {
        return this.r2StorageService.testConnection();
    }
    async runConnectionTest() {
        return this.r2StorageService.testConnection();
    }
    async getBucketInfo() {
        return this.r2StorageService.getBucketInfo();
    }
    async getConfig() {
        const config = this.r2StorageService['config'];
        return {
            bucketName: config.bucketName,
            region: config.region,
            endpoint: config.endpoint,
            maxFileSize: config.maxFileSize,
            allowedMimeTypes: config.allowedMimeTypes,
            presignedUrlExpiration: config.presignedUrlExpiration,
            cacheControl: config.cacheControl,
            enableCdn: config.enableCdn,
        };
    }
};
exports.R2HealthController = R2HealthController;
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Check R2 connection status',
        description: 'Performs comprehensive R2 connectivity and permission tests',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'R2 connection status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                isConnected: { type: 'boolean' },
                bucketExists: { type: 'boolean' },
                canUpload: { type: 'boolean' },
                canDownload: { type: 'boolean' },
                canDelete: { type: 'boolean' },
                bucketName: { type: 'string' },
                endpoint: { type: 'string' },
                errors: { type: 'array', items: { type: 'string' } },
                testResults: {
                    type: 'object',
                    properties: {
                        configuration: { type: 'boolean' },
                        bucketAccess: { type: 'boolean' },
                        uploadTest: { type: 'boolean' },
                        downloadTest: { type: 'boolean' },
                        deleteTest: { type: 'boolean' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], R2HealthController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Run comprehensive R2 connection test',
        description: 'Executes full R2 connectivity test including upload, download, and delete operations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'R2 connection test completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'R2 connection test failed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], R2HealthController.prototype, "runConnectionTest", null);
__decorate([
    (0, common_1.Get)('bucket-info'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get R2 bucket information',
        description: 'Retrieves basic information about the R2 bucket including object count and sample files',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bucket information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                bucketName: { type: 'string' },
                endpoint: { type: 'string' },
                region: { type: 'string' },
                objectCount: { type: 'number' },
                sampleObjects: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            key: { type: 'string' },
                            size: { type: 'number' },
                            lastModified: { type: 'string' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Failed to retrieve bucket information',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], R2HealthController.prototype, "getBucketInfo", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get R2 configuration (without sensitive data)',
        description: 'Returns R2 configuration details excluding sensitive credentials',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'R2 configuration retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                bucketName: { type: 'string' },
                region: { type: 'string' },
                endpoint: { type: 'string' },
                maxFileSize: { type: 'number' },
                allowedMimeTypes: { type: 'array', items: { type: 'string' } },
                presignedUrlExpiration: { type: 'number' },
                cacheControl: { type: 'string' },
                enableCdn: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], R2HealthController.prototype, "getConfig", null);
exports.R2HealthController = R2HealthController = __decorate([
    (0, swagger_1.ApiTags)('R2 Health Check'),
    (0, common_1.Controller)('r2-health'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [r2_storage_service_1.R2StorageService])
], R2HealthController);
//# sourceMappingURL=r2-health.controller.js.map