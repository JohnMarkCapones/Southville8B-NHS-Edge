import { registerAs } from '@nestjs/config';

export default registerAs('cloudflareImages', () => ({
  // Cloudflare Images Configuration
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_IMAGES_API_TOKEN,
  accountHash: process.env.CLOUDFLARE_ACCOUNT_HASH,
  baseUrl:
    process.env.CLOUDFLARE_IMAGES_BASE_URL || 'https://imagedelivery.net',
  defaultVariant: process.env.CLOUDFLARE_IMAGES_DEFAULT_VARIANT || 'public',

  // API Configuration
  apiBaseUrl: 'https://api.cloudflare.com/client/v4',
  timeout: parseInt(process.env.CLOUDFLARE_IMAGES_TIMEOUT || '30000'), // 30 seconds

  // File Upload Configuration
  maxFileSize: parseInt(
    process.env.CLOUDFLARE_IMAGES_MAX_FILE_SIZE || '10485760',
  ), // 10MB default
  allowedMimeTypes: process.env.CLOUDFLARE_IMAGES_ALLOWED_MIME_TYPES?.split(
    ',',
  ) || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
  ],

  // Variant Configuration
  variants: {
    thumbnail: { width: 200, height: 200, fit: 'contain' },
    card: { width: 600, height: 400, fit: 'scale-down' },
    public: { width: 1200, height: 1200, fit: 'scale-down' },
    original: { width: null, height: null, fit: 'scale-down' },
  },

  // Feature Flags
  enableCloudflareImages: process.env.ENABLE_CLOUDFLARE_IMAGES === 'true',
  enableFallbackToR2: process.env.ENABLE_CLOUDFLARE_IMAGES_FALLBACK !== 'false',

  // Logging Configuration
  enableRequestLogging:
    process.env.CLOUDFLARE_IMAGES_ENABLE_REQUEST_LOGGING === 'true',
  enableErrorLogging:
    process.env.CLOUDFLARE_IMAGES_ENABLE_ERROR_LOGGING !== 'false',
}));




