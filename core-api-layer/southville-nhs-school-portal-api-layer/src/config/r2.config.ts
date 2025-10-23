import { registerAs } from '@nestjs/config';

export default registerAs('r2', () => ({
  // Cloudflare R2 Configuration
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  region: process.env.R2_REGION || 'auto',
  publicUrl: process.env.R2_PUBLIC_URL,

  // R2 Endpoint Configuration
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  // File Upload Configuration
  maxFileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760'), // 10MB default
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

  // Security Configuration
  enableVirusScanning: process.env.R2_ENABLE_VIRUS_SCANNING === 'true',
  enableContentValidation: process.env.R2_ENABLE_CONTENT_VALIDATION !== 'false',

  // Performance Configuration
  multipartThreshold: parseInt(
    process.env.R2_MULTIPART_THRESHOLD || '10485760',
  ), // 10MB
  multipartChunksize: parseInt(process.env.R2_MULTIPART_CHUNKSIZE || '5242880'), // 5MB
  maxConcurrency: parseInt(process.env.R2_MAX_CONCURRENCY || '3'),

  // Cache Configuration
  cacheControl: process.env.R2_CACHE_CONTROL || 'public, max-age=31536000', // 1 year
  enableCdn: process.env.R2_ENABLE_CDN !== 'false',

  // Presigned URL Configuration
  presignedUrlExpiration: parseInt(
    process.env.R2_PRESIGNED_URL_EXPIRATION || '3600',
  ), // 1 hour

  // Connection Configuration
  connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '30000'), // 30 seconds
  requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '60000'), // 60 seconds
  maxRetries: parseInt(process.env.R2_MAX_RETRIES || '3'),

  // Logging Configuration
  enableRequestLogging: process.env.R2_ENABLE_REQUEST_LOGGING === 'true',
  logLevel: process.env.R2_LOG_LEVEL || 'info',
}));
