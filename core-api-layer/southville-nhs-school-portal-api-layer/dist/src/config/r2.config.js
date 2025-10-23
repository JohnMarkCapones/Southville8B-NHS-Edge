"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('r2', () => ({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    region: process.env.R2_REGION || 'auto',
    publicUrl: process.env.R2_PUBLIC_URL,
    endpoint: process.env.R2_ENDPOINT ||
        `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    maxFileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760'),
    allowedMimeTypes: process.env.R2_ALLOWED_MIME_TYPES?.split(',') || [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    enableVirusScanning: process.env.R2_ENABLE_VIRUS_SCANNING === 'true',
    enableContentValidation: process.env.R2_ENABLE_CONTENT_VALIDATION !== 'false',
    multipartThreshold: parseInt(process.env.R2_MULTIPART_THRESHOLD || '10485760'),
    multipartChunksize: parseInt(process.env.R2_MULTIPART_CHUNKSIZE || '5242880'),
    maxConcurrency: parseInt(process.env.R2_MAX_CONCURRENCY || '3'),
    cacheControl: process.env.R2_CACHE_CONTROL || 'public, max-age=31536000',
    enableCdn: process.env.R2_ENABLE_CDN !== 'false',
    presignedUrlExpiration: parseInt(process.env.R2_PRESIGNED_URL_EXPIRATION || '3600'),
    connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '30000'),
    requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '60000'),
    maxRetries: parseInt(process.env.R2_MAX_RETRIES || '3'),
    enableRequestLogging: process.env.R2_ENABLE_REQUEST_LOGGING === 'true',
    logLevel: process.env.R2_LOG_LEVEL || 'info',
}));
//# sourceMappingURL=r2.config.js.map