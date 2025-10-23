import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
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
 * Handles R2 file operations for gallery items
 */
@Injectable()
export class GalleryStorageService {
  private readonly logger = new Logger(GalleryStorageService.name);

  constructor(private readonly r2StorageService: R2StorageService) {}

  /**
   * Upload a gallery item file to R2 (Simplified - no album needed)
   * @param file - File buffer and metadata
   * @param uploadedBy - User ID who is uploading
   * @returns Upload result with R2 keys and URLs
   */
  async uploadGalleryItem(
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
    // Validate MIME type
    if (!isValidMimeType(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. ` +
          `Allowed types: ${[...ALLOWED_IMAGE_MIME_TYPES, ...ALLOWED_VIDEO_MIME_TYPES].join(', ')}`,
      );
    }

    // Validate file size
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

    this.logger.log(`Successfully uploaded: ${r2Key}`);

    return {
      r2_file_key: r2Key,
      file_url: uploadResult.publicUrl || '',
      file_size_bytes: file.size,
      mime_type: file.mimetype,
      media_type: mediaType,
    };
  }

  /**
   * Delete a gallery item file from R2
   * @param r2FileKey - R2 key to delete
   * @returns Delete result
   */
  async deleteGalleryItem(r2FileKey: string): Promise<void> {
    try {
      this.logger.log(`Deleting gallery item from R2: ${r2FileKey}`);
      const deleteResult = await this.r2StorageService.deleteFile(r2FileKey);

      if (!deleteResult.success) {
        this.logger.warn(
          `Failed to delete R2 file: ${r2FileKey}`,
          deleteResult.error,
        );
        // Don't throw - file might already be deleted or not exist
      } else {
        this.logger.log(`Successfully deleted: ${r2FileKey}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting R2 file: ${r2FileKey}`, error);
      // Don't throw - allow database cleanup to proceed
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
