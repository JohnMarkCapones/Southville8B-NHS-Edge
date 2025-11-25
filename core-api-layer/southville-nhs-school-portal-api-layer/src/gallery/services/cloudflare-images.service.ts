import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CloudflareImageUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: string[];
}

interface CloudflareImageDeleteResponse {
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: string[];
}

interface CloudflareImagesListResponse {
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: string[];
  result: {
    images: Array<{
      id: string;
      filename: string;
      uploaded: string;
    }>;
  };
}

/**
 * Cloudflare Images Service
 * Handles all interactions with Cloudflare Images API
 * Includes environment validation and connection testing
 * Uses native Node.js fetch (Node 18+)
 */
@Injectable()
export class CloudflareImagesService implements OnModuleInit {
  private readonly logger = new Logger(CloudflareImagesService.name);
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly accountHash: string;
  private readonly baseUrl: string;
  private readonly apiBaseUrl = 'https://api.cloudflare.com/client/v4';
  private isConfigValid = false;

  constructor(private readonly configService: ConfigService) {
    // Load configuration from environment variables
    this.accountId =
      this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID') || '';
    this.apiToken =
      this.configService.get<string>('CLOUDFLARE_IMAGES_API_TOKEN') || '';
    this.accountHash =
      this.configService.get<string>('CLOUDFLARE_ACCOUNT_HASH') || '';
    this.baseUrl =
      this.configService.get<string>(
        'CLOUDFLARE_IMAGES_BASE_URL',
        'https://imagedelivery.net',
      ) || 'https://imagedelivery.net';

    // Validate configuration on startup
    this.validateConfiguration();
  }

  /**
   * Validate that all required environment variables are present
   */
  private validateConfiguration(): void {
    const missingVars: string[] = [];

    if (!this.accountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
    if (!this.apiToken) missingVars.push('CLOUDFLARE_IMAGES_API_TOKEN');
    if (!this.accountHash) missingVars.push('CLOUDFLARE_ACCOUNT_HASH');

    if (missingVars.length > 0) {
      const errorMsg = `❌ Missing required Cloudflare Images environment variables: ${missingVars.join(', ')}`;
      this.logger.error(errorMsg);
      this.logger.error(
        '   Add these to your .env file in: core-api-layer/southville-nhs-school-portal-api-layer/.env',
      );
      throw new Error(errorMsg);
    }

    this.isConfigValid = true;
    this.logger.log('✅ Cloudflare Images configuration validated');
    this.logger.log(`   Account ID: ${this.accountId}`);
    this.logger.log(`   Account Hash: ${this.accountHash}`);
    this.logger.log(`   Base URL: ${this.baseUrl}`);
  }

  /**
   * Test connection to Cloudflare Images API on module initialization
   * This runs automatically when the app starts
   */
  async onModuleInit() {
    if (this.isConfigValid) {
      this.logger.log('🔄 Testing Cloudflare Images API connection...');
      try {
        await this.testConnection();
        this.logger.log('✅ Successfully connected to Cloudflare Images API');
        this.logger.log('   Gallery uploads will use Cloudflare Images');
      } catch (error) {
        this.logger.error('❌ Failed to connect to Cloudflare Images API');
        this.logger.error(`   Error: ${error.message}`);
        this.logger.error('   Please verify:');
        this.logger.error('   1. CLOUDFLARE_IMAGES_API_TOKEN is correct');
        this.logger.error(
          '   2. API token has "Cloudflare Images: Edit" permission',
        );
        this.logger.error('   3. Account ID matches the token');
      }
    }
  }

  /**
   * Test connection to Cloudflare Images API
   * Makes a simple API call to verify credentials work
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/accounts/${this.accountId}/images/v1?per_page=1`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );

      const data: CloudflareImagesListResponse = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API token (401 Unauthorized)');
        } else if (response.status === 403) {
          throw new Error(
            'Access forbidden - Check API token permissions (403)',
          );
        } else {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`,
          );
        }
      }

      if (data.success) {
        return true;
      } else {
        this.logger.error('API returned errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Unknown API error');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Connection test failed');
    }
  }

  /**
   * Upload an image to Cloudflare Images
   * @param file - The file to upload (Express.Multer.File format)
   * @param metadata - Optional metadata to attach to the image
   * @returns Upload result with image ID and URL
   */
  async uploadImage(
    file: Express.Multer.File,
    metadata?: Record<string, string>,
  ): Promise<{
    cf_image_id: string;
    cf_image_url: string;
    file_size_bytes: number;
    mime_type: string;
    media_type: 'image' | 'video';
  }> {
    try {
      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif',
      ];

      if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not supported. Supported types: ${allowedMimeTypes.join(', ')}`,
        );
      }

      // Validate file size (10MB limit for Cloudflare Images)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File size exceeds 10MB limit (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        );
      }

      this.logger.log(
        `Uploading to Cloudflare Images: ${file.originalname} (${(file.size / 1024).toFixed(2)}KB)`,
      );

      // Prepare form data using web FormData API (Node 18+)
      const formData = new FormData();

      // Create a Blob from the buffer (convert Buffer to Uint8Array for compatibility)
      const blob = new Blob([new Uint8Array(file.buffer)], {
        type: file.mimetype,
      });

      // Append the file as a Blob
      formData.append('file', blob, file.originalname);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Upload to Cloudflare Images using fetch
      // Note: Do NOT set Content-Type header - fetch will set it automatically with the correct boundary
      const response = await fetch(
        `${this.apiBaseUrl}/accounts/${this.accountId}/images/v1`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );

      const data: CloudflareImageUploadResponse = await response.json();

      if (!response.ok || !data.success) {
        this.logger.error('Upload failed:', data.errors);
        throw new BadRequestException(
          `Upload failed: ${data.errors[0]?.message || 'Unknown error'}`,
        );
      }

      const imageId = data.result.id;
      const imageUrl = `${this.baseUrl}/${this.accountHash}/${imageId}/public`;

      this.logger.log(`✅ Uploaded successfully: ${imageId}`);

      return {
        cf_image_id: imageId,
        cf_image_url: imageUrl,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        media_type: 'image',
      };
    } catch (error) {
      this.logger.error('Upload error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new BadRequestException(`Upload failed: ${error.message}`);
      }

      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Delete an image from Cloudflare Images
   * @param imageId - The Cloudflare Images ID to delete
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting image: ${imageId}`);

      const response = await fetch(
        `${this.apiBaseUrl}/accounts/${this.accountId}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );

      // Handle 404 as success (idempotent delete)
      if (response.status === 404) {
        this.logger.warn(`Image ${imageId} not found - may already be deleted`);
        return true;
      }

      const data: CloudflareImageDeleteResponse = await response.json();

      if (!response.ok || !data.success) {
        this.logger.error('Delete failed:', data.errors);
        return false;
      }

      this.logger.log(`✅ Deleted successfully: ${imageId}`);
      return true;
    } catch (error) {
      this.logger.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get image URL with specific variant
   */
  getImageUrl(
    imageId: string,
    variant: 'thumbnail' | 'card' | 'public' | 'original' = 'public',
  ): string {
    return `${this.baseUrl}/${this.accountHash}/${imageId}/${variant}`;
  }

  /**
   * Get thumbnail URL (200x200)
   */
  getThumbnailUrl(imageId: string): string {
    return this.getImageUrl(imageId, 'thumbnail');
  }

  /**
   * Get card preview URL (600x400)
   */
  getCardUrl(imageId: string): string {
    return this.getImageUrl(imageId, 'card');
  }

  /**
   * Get public URL (1200x1200) - full size viewing
   */
  getPublicUrl(imageId: string): string {
    return this.getImageUrl(imageId, 'public');
  }

  /**
   * Get original URL (original quality) - for downloads
   */
  getOriginalUrl(imageId: string): string {
    return this.getImageUrl(imageId, 'original');
  }

  /**
   * Get all variant URLs for an image
   */
  getAllVariants(imageId: string): Record<string, string> {
    return {
      thumbnail: this.getThumbnailUrl(imageId),
      card: this.getCardUrl(imageId),
      public: this.getPublicUrl(imageId),
      original: this.getOriginalUrl(imageId),
    };
  }

  /**
   * Check if a file is a supported image type
   */
  isImageFile(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
    ];
    return supportedTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): {
    isValid: boolean;
    accountId: string;
    accountHash: string;
    hasApiToken: boolean;
    baseUrl: string;
  } {
    return {
      isValid: this.isConfigValid,
      accountId: this.accountId || '❌ Not set',
      accountHash: this.accountHash || '❌ Not set',
      hasApiToken: !!this.apiToken,
      baseUrl: this.baseUrl,
    };
  }
}
