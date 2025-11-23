import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { CloudflareImagesService } from './cloudflare-images.service';
import * as crypto from 'crypto';
import * as path from 'path';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  isValidMimeType,
  getMediaTypeFromMimeType,
} from '../dto/validators/is-valid-mime-type.validator';

/**
 * File size limits (in bytes)
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Gallery Storage Service
 * Handles file operations for gallery items using Cloudflare Images for images and R2 for videos
 */
@Injectable()
export class GalleryStorageService {
  private readonly logger = new Logger(GalleryStorageService.name);

  constructor(
    private readonly r2StorageService: R2StorageService,
    private readonly cloudflareImagesService: CloudflareImagesService,
  ) {}

  /**
   * Upload a gallery item file using Cloudflare Images for images and R2 for videos
   * @param file - File buffer and metadata
   * @param uploadedBy - User ID who is uploading
   * @returns Upload result with appropriate keys and URLs
   */
  async uploadGalleryItem(
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<{
    cf_image_id?: string;
    cf_image_url?: string;
    r2_file_key?: string;
    file_url?: string;
    thumbnail_url?: string;
    r2_thumbnail_key?: string;
    file_size_bytes: number;
    mime_type: string;
    media_type: 'image' | 'video';
  }> {
    // Validate MIME type
    if (!isValidMimeType(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. ` +
          `Allowed types: ${[...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES].join(', ')}`,
      );
    }

    // Validate file size and determine media type
    const mediaType = getMediaTypeFromMimeType(file.mimetype);
    if (!mediaType) {
      throw new BadRequestException('Invalid media type');
    }

    if (mediaType === 'image' && file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `Image file size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`,
      );
    }
    if (mediaType === 'video' && file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException(
        `Video file size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB limit`,
      );
    }

    // Route to appropriate storage service
    if (mediaType === 'image') {
      // Use Cloudflare Images for images
      this.logger.log(
        `Uploading image to Cloudflare Images: ${file.originalname}`,
      );

      try {
        const uploadResult = await this.cloudflareImagesService.uploadImage(
          file,
          {
            uploadedBy,
            originalFilename: file.originalname,
          },
        );

        this.logger.log(
          `Successfully uploaded to Cloudflare Images: ${uploadResult.cf_image_id}`,
        );

        return {
          cf_image_id: uploadResult.cf_image_id,
          cf_image_url: uploadResult.cf_image_url,
          file_size_bytes: uploadResult.file_size_bytes,
          mime_type: uploadResult.mime_type,
          media_type: uploadResult.media_type,
        };
      } catch (error) {
        this.logger.error(
          'Cloudflare Images upload failed, falling back to R2:',
          error,
        );

        // Fallback to R2 if Cloudflare Images fails
        return this.uploadToR2(file, uploadedBy);
      }
    } else {
      // Use R2 for videos and other media
      return this.uploadToR2(file, uploadedBy);
    }
  }

  /**
   * Upload to R2 (fallback for videos and when Cloudflare Images fails)
   */
  private async uploadToR2(
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<{
    r2_file_key: string;
    file_url: string;
    thumbnail_url?: string;
    r2_thumbnail_key?: string;
    file_size_bytes: number;
    mime_type: string;
    media_type: 'image' | 'video';
  }> {
    // Generate R2 key (simplified - flat structure)
    const r2Key = this.generateR2Key(file.originalname);

    // Upload to R2
    this.logger.log(`Uploading gallery item to R2: ${r2Key}`);
    const uploadResult = await this.r2StorageService.uploadFile(
      r2Key,
      file.buffer,
      file.mimetype,
      {
        uploadedBy,
        originalFilename: file.originalname,
      },
    );

    if (!uploadResult.success) {
      this.logger.error('Failed to upload to R2:', uploadResult.error);
      throw new BadRequestException('Failed to upload file to storage');
    }

    this.logger.log(`Successfully uploaded to R2: ${r2Key}`);

    return {
      r2_file_key: r2Key,
      file_url: uploadResult.publicUrl || '',
      file_size_bytes: file.size,
      mime_type: file.mimetype,
      media_type: getMediaTypeFromMimeType(file.mimetype) || 'image',
    };
  }

  /**
   * Delete a gallery item file from storage (Cloudflare Images or R2)
   * @param storageKey - Storage key to delete (cf_image_id or r2_file_key)
   * @param storageType - Type of storage ('cloudflare_images' or 'r2')
   * @returns Delete result
   */
  async deleteGalleryItem(
    storageKey: string,
    storageType: 'cloudflare_images' | 'r2',
  ): Promise<boolean> {
    try {
      if (storageType === 'cloudflare_images') {
        this.logger.log(
          `Deleting gallery item from Cloudflare Images: ${storageKey}`,
        );
        return await this.cloudflareImagesService.deleteImage(storageKey);
      } else {
        this.logger.log(`Deleting gallery item from R2: ${storageKey}`);
        const deleteResult = await this.r2StorageService.deleteFile(storageKey);

        if (!deleteResult.success) {
          this.logger.warn(
            `Failed to delete R2 file: ${storageKey}`,
            deleteResult.error,
          );
          return false;
        } else {
          this.logger.log(`Successfully deleted from R2: ${storageKey}`);
          return true;
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting from ${storageType}:`, error);
      return false;
    }
  }

  /**
   * Generate presigned download URL for a gallery item
   * @param r2FileKey - R2 key
   * @param expiresIn - Expiration time in seconds (default 1 hour)
   * @returns Presigned URL
   */
  async generateDownloadUrl(
    r2FileKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      this.logger.log(`Generating download URL for: ${r2FileKey}`);
      const presignedUrl = await this.r2StorageService.generatePresignedUrl(
        r2FileKey,
        'getObject',
        expiresIn,
      );

      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL for: ${r2FileKey}`,
        error,
      );
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Generate R2 key for gallery item (simplified - flat structure)
   * @param filename - Original filename
   * @returns R2 key path
   */
  private generateR2Key(filename: string): string {
    const uuid = crypto.randomUUID();
    const ext = path.extname(filename);
    const sanitizedName = filename
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50); // Limit filename length

    return `gallery/${uuid}-${sanitizedName}${ext}`;
  }

  /**
   * Generate R2 key for thumbnail
   * @param originalR2Key - Original file R2 key
   * @returns Thumbnail R2 key
   */
  private generateThumbnailKey(originalR2Key: string): string {
    const parsedPath = path.parse(originalR2Key);
    return `${parsedPath.dir}/thumbnails/${parsedPath.name}_thumb${parsedPath.ext}`;
  }

  /**
   * Validate file is an allowed type
   * @param mimeType - MIME type to validate
   * @returns True if valid
   */
  isValidFileType(mimeType: string): boolean {
    return isValidMimeType(mimeType);
  }

  /**
   * Get media type from MIME type
   * @param mimeType - MIME type
   * @returns Media type (image or video)
   */
  getMediaType(mimeType: string): 'image' | 'video' | null {
    return getMediaTypeFromMimeType(mimeType);
  }
}
