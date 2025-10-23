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
var R2ConfigValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2ConfigValidationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let R2ConfigValidationService = R2ConfigValidationService_1 = class R2ConfigValidationService {
    configService;
    logger = new common_1.Logger(R2ConfigValidationService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    validateR2Config() {
        this.logger.log('Validating R2 configuration...');
        const requiredEnvVars = [
            'R2_ACCOUNT_ID',
            'R2_ACCESS_KEY_ID',
            'R2_SECRET_ACCESS_KEY',
            'R2_BUCKET_NAME',
        ];
        const missingVars = [];
        for (const envVar of requiredEnvVars) {
            const value = this.configService.get(`r2.${envVar.toLowerCase()}`);
            if (!value) {
                missingVars.push(envVar);
            }
        }
        if (missingVars.length > 0) {
            const errorMessage = `Missing required R2 environment variables: ${missingVars.join(', ')}`;
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        const accountId = this.configService.get('r2.accountId');
        if (accountId && accountId.length !== 32) {
            this.logger.warn(`R2_ACCOUNT_ID should be 32 characters long, got ${accountId.length}`);
        }
        const bucketName = this.configService.get('r2.bucketName');
        if (bucketName) {
            if (bucketName.length < 3 || bucketName.length > 63) {
                throw new Error('R2_BUCKET_NAME must be between 3 and 63 characters');
            }
            if (!/^[a-z0-9.-]+$/.test(bucketName)) {
                throw new Error('R2_BUCKET_NAME can only contain lowercase letters, numbers, dots, and hyphens');
            }
        }
        const maxFileSize = this.configService.get('r2.maxFileSize');
        if (maxFileSize && maxFileSize > 5 * 1024 * 1024 * 1024) {
            this.logger.warn('R2_MAX_FILE_SIZE exceeds 5GB, this may cause performance issues');
        }
        const allowedMimeTypes = this.configService.get('r2.allowedMimeTypes');
        if (allowedMimeTypes && allowedMimeTypes.length === 0) {
            this.logger.warn('No allowed MIME types configured, this may be a security risk');
        }
        this.logger.log('R2 configuration validation completed successfully');
    }
    getR2Config() {
        return {
            accountId: this.configService.get('r2.accountId'),
            accessKeyId: this.configService.get('r2.accessKeyId'),
            secretAccessKey: this.configService.get('r2.secretAccessKey'),
            bucketName: this.configService.get('r2.bucketName'),
            region: this.configService.get('r2.region'),
            endpoint: this.configService.get('r2.endpoint'),
            publicUrl: this.configService.get('r2.publicUrl'),
            maxFileSize: this.configService.get('r2.maxFileSize'),
            allowedMimeTypes: this.configService.get('r2.allowedMimeTypes'),
            presignedUrlExpiration: this.configService.get('r2.presignedUrlExpiration'),
            cacheControl: this.configService.get('r2.cacheControl'),
            enableCdn: this.configService.get('r2.enableCdn'),
        };
    }
    isR2Configured() {
        try {
            this.validateR2Config();
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.R2ConfigValidationService = R2ConfigValidationService;
exports.R2ConfigValidationService = R2ConfigValidationService = R2ConfigValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2ConfigValidationService);
//# sourceMappingURL=r2-config-validation.service.js.map