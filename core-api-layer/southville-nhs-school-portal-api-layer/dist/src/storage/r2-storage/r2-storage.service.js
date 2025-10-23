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
var R2StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let R2StorageService = R2StorageService_1 = class R2StorageService {
    configService;
    logger = new common_1.Logger(R2StorageService_1.name);
    s3Client;
    config;
    constructor(configService) {
        this.configService = configService;
        this.config = this.configService.get('r2');
        this.s3Client = new client_s3_1.S3Client({
            region: this.config.region,
            endpoint: this.config.endpoint,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
            forcePathStyle: true,
        });
    }
    async testConnection() {
        const errors = [];
        const testResults = {
            configuration: false,
            bucketAccess: false,
            uploadTest: false,
            downloadTest: false,
            deleteTest: false,
        };
        try {
            if (this.config.accountId &&
                this.config.accessKeyId &&
                this.config.secretAccessKey &&
                this.config.bucketName) {
                testResults.configuration = true;
            }
            else {
                errors.push('Missing required R2 configuration');
            }
            try {
                await this.s3Client.send(new client_s3_1.ListObjectsV2Command({
                    Bucket: this.config.bucketName,
                    MaxKeys: 1,
                }));
                testResults.bucketAccess = true;
            }
            catch (error) {
                errors.push(`Bucket access failed: ${error.message}`);
            }
            try {
                const testKey = `test/connection-test-${Date.now()}.txt`;
                const testContent = 'R2 connection test';
                await this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: testKey,
                    Body: testContent,
                    ContentType: 'text/plain',
                }));
                testResults.uploadTest = true;
            }
            catch (error) {
                errors.push(`Upload test failed: ${error.message}`);
            }
            try {
                const testKey = `test/connection-test-${Date.now()}.txt`;
                await this.s3Client.send(new client_s3_1.GetObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: testKey,
                }));
                testResults.downloadTest = true;
            }
            catch (error) {
                errors.push(`Download test failed: ${error.message}`);
            }
            try {
                const testKey = `test/connection-test-${Date.now()}.txt`;
                await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: testKey,
                }));
                testResults.deleteTest = true;
            }
            catch (error) {
                errors.push(`Delete test failed: ${error.message}`);
            }
            const isConnected = testResults.configuration && testResults.bucketAccess;
            const bucketExists = testResults.bucketAccess;
            return {
                isConnected,
                bucketExists,
                canUpload: testResults.uploadTest,
                canDownload: testResults.downloadTest,
                canDelete: testResults.deleteTest,
                bucketName: this.config.bucketName,
                endpoint: this.config.endpoint,
                errors,
                testResults,
            };
        }
        catch (error) {
            this.logger.error('R2 connection test failed:', error);
            errors.push(`Connection test failed: ${error.message}`);
            return {
                isConnected: false,
                bucketExists: false,
                canUpload: false,
                canDownload: false,
                canDelete: false,
                bucketName: this.config.bucketName || '',
                endpoint: this.config.endpoint || '',
                errors,
                testResults,
            };
        }
    }
    async uploadFile(key, body, contentType, metadata) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.config.bucketName,
                Key: key,
                Body: body,
                ContentType: contentType,
                Metadata: metadata,
                CacheControl: this.config.cacheControl,
            });
            await this.s3Client.send(command);
            const publicUrl = this.config.publicUrl
                ? `${this.config.publicUrl}/${key}`
                : undefined;
            return {
                success: true,
                key,
                publicUrl,
            };
        }
        catch (error) {
            this.logger.error('Failed to upload file to R2:', error);
            return {
                success: false,
                key,
                error: error.message,
            };
        }
    }
    async generatePresignedUrl(key, operation = 'getObject', expiresIn = 3600) {
        try {
            const command = operation === 'getObject'
                ? new client_s3_1.GetObjectCommand({ Bucket: this.config.bucketName, Key: key })
                : new client_s3_1.PutObjectCommand({ Bucket: this.config.bucketName, Key: key });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            this.logger.error('Failed to generate presigned URL:', error);
            throw new common_1.BadRequestException('Failed to generate download URL');
        }
    }
    async getPresignedUrl(key, expiresIn = 3600) {
        return this.generatePresignedUrl(key, 'getObject', expiresIn);
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.config.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            return {
                success: true,
                key,
            };
        }
        catch (error) {
            this.logger.error('Failed to delete file from R2:', error);
            return {
                success: false,
                key,
                error: error.message,
            };
        }
    }
    async listFiles(prefix) {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.config.bucketName,
                Prefix: prefix,
            });
            const response = await this.s3Client.send(command);
            return response.Contents?.map((obj) => obj.Key || '') || [];
        }
        catch (error) {
            this.logger.error('Failed to list files from R2:', error);
            return [];
        }
    }
    async getFileInfo(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.config.bucketName,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            return {
                exists: true,
                size: response.ContentLength,
                lastModified: response.LastModified?.toISOString(),
                mimeType: response.ContentType,
            };
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return { exists: false };
            }
            this.logger.error('Failed to get file info from R2:', error);
            return { exists: false };
        }
    }
    async getBucketInfo() {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.config.bucketName,
                MaxKeys: 10,
            });
            const response = await this.s3Client.send(command);
            return {
                bucketName: this.config.bucketName,
                endpoint: this.config.endpoint,
                region: this.config.region,
                objectCount: response.KeyCount || 0,
                sampleObjects: (response.Contents || []).map((obj) => ({
                    key: obj.Key || '',
                    size: obj.Size || 0,
                    lastModified: obj.LastModified?.toISOString() || '',
                })),
            };
        }
        catch (error) {
            this.logger.error('Failed to get bucket info from R2:', error);
            throw new common_1.BadRequestException('Failed to retrieve bucket information');
        }
    }
};
exports.R2StorageService = R2StorageService;
exports.R2StorageService = R2StorageService = R2StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], R2StorageService);
//# sourceMappingURL=r2-storage.service.js.map