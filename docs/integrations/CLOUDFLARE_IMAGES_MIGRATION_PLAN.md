# Cloudflare Images Migration Plan

## Project: Southville 8B NHS Edge - Gallery System Migration

**Date**: 2025-10-24
**Current State**: Cloudflare R2 Storage
**Target State**: Cloudflare Images + R2 Hybrid Approach

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Target Architecture](#target-architecture)
4. [Migration Strategy](#migration-strategy)
5. [Environment Configuration](#environment-configuration)
6. [Backend Implementation](#backend-implementation)
7. [Database Schema Updates](#database-schema-updates)
8. [Frontend Updates](#frontend-updates)
9. [Testing Plan](#testing-plan)
10. [Deployment Strategy](#deployment-strategy)
11. [Timeline & Milestones](#timeline--milestones)
12. [Rollback Plan](#rollback-plan)

---

## 1. Executive Summary

### Why Cloudflare Images?

**Current Pain Points with R2:**
- Manual image optimization required
- No automatic thumbnail generation
- No automatic format conversion (WebP/AVIF)
- No automatic responsive image variants
- Higher bandwidth costs for serving images

**Benefits of Cloudflare Images:**
- **Automatic Optimization**: Serves images in WebP/AVIF automatically
- **Automatic Resizing**: Creates variants (thumbnail, card, public, etc.) on-the-fly
- **CDN Delivery**: Built-in global CDN for fast delivery
- **Cost Savings**: Pay per image stored, unlimited transformations
- **Developer Experience**: Simple API with URL-based transformations

### Hybrid Approach (Recommended)

**Cloudflare Images**: Photos and images (JPEG, PNG, GIF, WebP)
**Cloudflare R2**: Videos and other media files

**Rationale**:
- Cloudflare Images is optimized specifically for photos
- Videos require different optimization strategies
- R2 is more cost-effective for large video files
- Keep existing R2 infrastructure for non-image files

---

## 2. Current Architecture

### Current File Storage Flow

```
User Upload → NestJS Backend → Cloudflare R2 Bucket
                                  ↓
                            - Original file (gallery-items/)
                            - Manual thumbnail (gallery-items/thumbnails/)
```

### Current Database Schema

```sql
gallery_items (
  id uuid PRIMARY KEY,
  file_url text NOT NULL,           -- R2 file URL
  r2_file_key text NOT NULL,        -- R2 object key
  thumbnail_url text,               -- R2 thumbnail URL
  r2_thumbnail_key text,            -- R2 thumbnail key
  mime_type text NOT NULL,
  media_type text NOT NULL,         -- 'image' or 'video'
  file_size_bytes bigint NOT NULL,
  ...
)
```

### Current Backend Services

- **`GalleryStorageService`**: Handles R2 uploads, deletions, presigned URLs
- **`GalleryItemsService`**: Business logic for gallery items
- Uses `@aws-sdk/client-s3` for R2 operations

---

## 3. Target Architecture

### New File Storage Flow

```
User Upload → NestJS Backend → Route by Media Type
                                  ↓
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
            Cloudflare Images              Cloudflare R2
            (image/* files)                (video/* files)
                    ↓                           ↓
            - Image ID                     - Original file
            - Auto variants                - Manual thumbnail
            - CDN delivery                 - Presigned URLs
```

### New Database Schema

```sql
gallery_items (
  id uuid PRIMARY KEY,

  -- Storage provider info
  storage_provider text NOT NULL,   -- 'cloudflare_images' or 'r2'

  -- Cloudflare Images fields (for images)
  cf_image_id text,                 -- Cloudflare Images ID
  cf_image_url text,                -- Base delivery URL

  -- R2 fields (for videos and legacy)
  file_url text,                    -- R2 file URL (nullable)
  r2_file_key text,                 -- R2 object key (nullable)
  thumbnail_url text,               -- R2 thumbnail URL (nullable)
  r2_thumbnail_key text,            -- R2 thumbnail key (nullable)

  -- Common metadata
  mime_type text NOT NULL,
  media_type text NOT NULL,         -- 'image' or 'video'
  file_size_bytes bigint NOT NULL,
  original_filename text NOT NULL,
  ...
)
```

### Image Variant URLs

With Cloudflare Images, variants are accessed via URL patterns:

```
Base URL: https://imagedelivery.net/{account_hash}/{image_id}/{variant}

Examples:
- Thumbnail: https://imagedelivery.net/kslzpqjNVD4TQGhwBAY6ew/{id}/thumbnail
- Card: https://imagedelivery.net/kslzpqjNVD4TQGhwBAY6ew/{id}/card
- Public: https://imagedelivery.net/kslzpqjNVD4TQGhwBAY6ew/{id}/public
```

**Recommended Variants to Create:**
- `thumbnail`: 200x200 (fit), for grid previews
- `card`: 600x400 (scale-down), for card components
- `public`: 1200x1200 (scale-down), for full-size viewing
- `original`: No size limit (original quality)

---

## 4. Migration Strategy

### Phase 1: Setup & Configuration (Week 1)

**Tasks:**
1. ✅ Obtain Cloudflare API credentials
2. ✅ Configure environment variables
3. Create image variants in Cloudflare dashboard
4. Update database schema (migration script)
5. Implement new backend services

**Deliverables:**
- Cloudflare Images variants configured
- Database migration ready
- New backend code deployed (feature-flagged)

### Phase 2: New Uploads (Week 2)

**Tasks:**
1. Deploy backend with hybrid upload logic
2. Test new image uploads → Cloudflare Images
3. Test new video uploads → R2 (existing flow)
4. Monitor error rates and performance

**Deliverables:**
- All new image uploads use Cloudflare Images
- All new video uploads continue using R2
- Frontend displays both old and new items correctly

### Phase 3: Testing & Monitoring (Week 2-3)

**Tasks:**
1. Comprehensive testing of all gallery operations
2. Performance monitoring and optimization
3. User acceptance testing
4. Bug fixes and adjustments

**Deliverables:**
- Stable hybrid system
- Performance metrics documented
- User feedback incorporated

### Migration Approach for Existing Images

**Recommendation: Keep existing images on R2**

**Rationale:**
- Migrating thousands of images is risky and expensive
- No immediate benefit to end users
- Existing R2 URLs continue working
- New images get automatic optimization

**Optional Future Migration:**
- Background job to migrate popular/featured images
- Migrate on-demand when images are edited
- Set deadline (e.g., 1 year) for full migration

---

## 5. Environment Configuration

### Backend Environment Variables

Add to `core-api-layer/southville-nhs-school-portal-api-layer/.env`:

```env
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=a9f924050e1f1ee11d51659b08634fc4
CLOUDFLARE_IMAGES_API_TOKEN=hDvmTh4JPoLFlNXCBYt5SRz6pCMngy_nJpBsHVJS
CLOUDFLARE_ACCOUNT_HASH=kslzpqjNVD4TQGhwBAY6ew
CLOUDFLARE_IMAGES_BASE_URL=https://imagedelivery.net

# Default variant for public viewing
CLOUDFLARE_IMAGES_DEFAULT_VARIANT=public

# Feature flag for gradual rollout
ENABLE_CLOUDFLARE_IMAGES=true
```

### Variant Configuration

Create these variants in Cloudflare Images dashboard:

| Variant Name | Width | Height | Fit Mode | Use Case |
|--------------|-------|--------|----------|----------|
| `thumbnail` | 200 | 200 | contain | Gallery grid thumbnails |
| `card` | 600 | 400 | scale-down | Card previews |
| `public` | 1200 | 1200 | scale-down | Full-size viewing |
| `original` | - | - | - | Original quality |

**How to Create Variants:**
1. Go to Cloudflare Dashboard → Images → Variants
2. Click "Create Variant"
3. Set name, dimensions, and fit mode
4. Save

---

## 6. Backend Implementation

### 6.1 Create Cloudflare Images Service

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/gallery/services/cloudflare-images.service.ts`

```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface CloudflareImageUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

interface CloudflareImageDeleteResponse {
  success: boolean;
  errors: any[];
  messages: any[];
}

@Injectable()
export class CloudflareImagesService {
  private readonly logger = new Logger(CloudflareImagesService.name);
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly accountHash: string;
  private readonly baseUrl: string;
  private readonly defaultVariant: string;
  private readonly apiBaseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(private readonly configService: ConfigService) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    this.apiToken = this.configService.get<string>('CLOUDFLARE_IMAGES_API_TOKEN');
    this.accountHash = this.configService.get<string>('CLOUDFLARE_ACCOUNT_HASH');
    this.baseUrl = this.configService.get<string>('CLOUDFLARE_IMAGES_BASE_URL', 'https://imagedelivery.net');
    this.defaultVariant = this.configService.get<string>('CLOUDFLARE_IMAGES_DEFAULT_VARIANT', 'public');

    if (!this.accountId || !this.apiToken || !this.accountHash) {
      this.logger.error('Missing Cloudflare Images configuration');
      throw new Error('Cloudflare Images is not properly configured');
    }
  }

  /**
   * Upload an image to Cloudflare Images
   */
  async uploadImage(
    file: Express.Multer.File,
    metadata?: Record<string, string>,
  ): Promise<{
    imageId: string;
    imageUrl: string;
    variants: string[];
  }> {
    try {
      const formData = new FormData();

      // Create a Blob from the buffer
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axios.post<CloudflareImageUploadResponse>(
        `${this.apiBaseUrl}/accounts/${this.accountId}/images/v1`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        },
      );

      if (!response.data.success) {
        this.logger.error('Cloudflare Images upload failed:', response.data.errors);
        throw new BadRequestException('Failed to upload image to Cloudflare Images');
      }

      const result = response.data.result;
      const imageUrl = this.buildImageUrl(result.id, this.defaultVariant);

      this.logger.log(`Image uploaded to Cloudflare Images: ${result.id}`);

      return {
        imageId: result.id,
        imageUrl: imageUrl,
        variants: result.variants,
      };
    } catch (error) {
      this.logger.error('Error uploading to Cloudflare Images:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Delete an image from Cloudflare Images
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const response = await axios.delete<CloudflareImageDeleteResponse>(
        `${this.apiBaseUrl}/accounts/${this.accountId}/images/v1/${imageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        },
      );

      if (!response.data.success) {
        this.logger.error('Cloudflare Images delete failed:', response.data.errors);
        throw new BadRequestException('Failed to delete image from Cloudflare Images');
      }

      this.logger.log(`Image deleted from Cloudflare Images: ${imageId}`);
    } catch (error) {
      this.logger.error('Error deleting from Cloudflare Images:', error);
      throw new BadRequestException('Failed to delete image');
    }
  }

  /**
   * Build image URL for a specific variant
   */
  buildImageUrl(imageId: string, variant: string = this.defaultVariant): string {
    return `${this.baseUrl}/${this.accountHash}/${imageId}/${variant}`;
  }

  /**
   * Get all variant URLs for an image
   */
  getImageVariants(imageId: string): Record<string, string> {
    const variants = ['thumbnail', 'card', 'public', 'original'];

    return variants.reduce((acc, variant) => {
      acc[variant] = this.buildImageUrl(imageId, variant);
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Check if file is an image that should use Cloudflare Images
   */
  isImageFile(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return supportedTypes.includes(mimeType);
  }
}
```

### 6.2 Update Gallery Storage Service

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/gallery/services/gallery-storage.service.ts`

Update the service to route uploads based on file type:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudflareImagesService } from './cloudflare-images.service';
// ... existing imports

@Injectable()
export class GalleryStorageService {
  private readonly logger = new Logger(GalleryStorageService.name);
  private readonly enableCloudflareImages: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly cloudflareImagesService: CloudflareImagesService,
    // ... existing dependencies
  ) {
    this.enableCloudflareImages = this.configService.get<boolean>(
      'ENABLE_CLOUDFLARE_IMAGES',
      false,
    );
  }

  /**
   * Upload gallery item (routes to CF Images or R2 based on file type)
   */
  async uploadGalleryItem(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{
    storage_provider: 'cloudflare_images' | 'r2';
    // Cloudflare Images fields
    cf_image_id?: string;
    cf_image_url?: string;
    // R2 fields
    file_url?: string;
    r2_file_key?: string;
    thumbnail_url?: string;
    r2_thumbnail_key?: string;
    // Common fields
    file_size_bytes: number;
    mime_type: string;
    media_type: 'image' | 'video';
  }> {
    const mimeType = file.mimetype;
    const mediaType = this.getMediaType(mimeType);

    // Route images to Cloudflare Images if enabled
    if (
      this.enableCloudflareImages &&
      mediaType === 'image' &&
      this.cloudflareImagesService.isImageFile(mimeType)
    ) {
      return this.uploadToCloudflareImages(file, userId);
    }

    // Fall back to R2 for videos or if CF Images disabled
    return this.uploadToR2(file, userId);
  }

  /**
   * Upload to Cloudflare Images
   */
  private async uploadToCloudflareImages(
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    try {
      const metadata = {
        userId: userId,
        originalFilename: file.originalname,
        uploadedAt: new Date().toISOString(),
      };

      const result = await this.cloudflareImagesService.uploadImage(file, metadata);

      this.logger.log(`Uploaded to Cloudflare Images: ${result.imageId}`);

      return {
        storage_provider: 'cloudflare_images',
        cf_image_id: result.imageId,
        cf_image_url: result.imageUrl,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        media_type: 'image',
      };
    } catch (error) {
      this.logger.error('Failed to upload to Cloudflare Images:', error);
      // Fallback to R2 if CF Images fails
      this.logger.warn('Falling back to R2 storage');
      return this.uploadToR2(file, userId);
    }
  }

  /**
   * Upload to R2 (existing implementation)
   */
  private async uploadToR2(
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    // ... existing R2 upload logic
    // Return format should match the new schema
    return {
      storage_provider: 'r2',
      file_url: uploadedUrl,
      r2_file_key: fileKey,
      thumbnail_url: thumbnailUrl,
      r2_thumbnail_key: thumbnailKey,
      file_size_bytes: file.size,
      mime_type: file.mimetype,
      media_type: this.getMediaType(file.mimetype),
    };
  }

  /**
   * Delete gallery item (handles both CF Images and R2)
   */
  async deleteGalleryItem(
    storageProvider: 'cloudflare_images' | 'r2',
    cfImageId?: string,
    r2FileKey?: string,
  ): Promise<void> {
    if (storageProvider === 'cloudflare_images' && cfImageId) {
      await this.cloudflareImagesService.deleteImage(cfImageId);
    } else if (storageProvider === 'r2' && r2FileKey) {
      // Existing R2 delete logic
      await this.deleteFromR2(r2FileKey);
    }
  }

  /**
   * Generate download URL (handles both providers)
   */
  async generateDownloadUrl(
    storageProvider: 'cloudflare_images' | 'r2',
    cfImageId?: string,
    r2FileKey?: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (storageProvider === 'cloudflare_images' && cfImageId) {
      // CF Images uses the 'original' variant for downloads
      return this.cloudflareImagesService.buildImageUrl(cfImageId, 'original');
    } else if (storageProvider === 'r2' && r2FileKey) {
      // Existing R2 presigned URL logic
      return this.generateR2PresignedUrl(r2FileKey, expiresIn);
    }

    throw new Error('Invalid storage provider or missing file identifier');
  }

  private getMediaType(mimeType: string): 'image' | 'video' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'image'; // default
  }

  // ... rest of existing methods
}
```

### 6.3 Update Gallery Items Service

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/gallery/services/gallery-items.service.ts`

Update the `create()` method to handle the new storage provider fields:

```typescript
async create(
  createItemDto: CreateItemDto,
  file: Express.Multer.File,
  userId: string,
): Promise<GalleryItem> {
  try {
    const defaultAlbumId = await this.getOrCreateDefaultAlbum(userId);

    // Upload file (will route to CF Images or R2 based on file type)
    const uploadResult = await this.galleryStorageService.uploadGalleryItem(
      file,
      userId,
    );

    // Build insert data based on storage provider
    const insertData: any = {
      album_id: defaultAlbumId,
      storage_provider: uploadResult.storage_provider,
      original_filename: file.originalname,
      file_size_bytes: uploadResult.file_size_bytes,
      mime_type: uploadResult.mime_type,
      media_type: uploadResult.media_type,
      title: createItemDto.title,
      caption: createItemDto.caption,
      alt_text: createItemDto.alt_text,
      display_order: createItemDto.display_order || 0,
      is_featured: createItemDto.is_featured || false,
      photographer_name: createItemDto.photographer_name,
      photographer_credit: createItemDto.photographer_credit,
      taken_at: createItemDto.taken_at,
      location: createItemDto.location,
      views_count: 0,
      downloads_count: 0,
      uploaded_by: userId,
    };

    // Add provider-specific fields
    if (uploadResult.storage_provider === 'cloudflare_images') {
      insertData.cf_image_id = uploadResult.cf_image_id;
      insertData.cf_image_url = uploadResult.cf_image_url;
    } else {
      insertData.file_url = uploadResult.file_url;
      insertData.r2_file_key = uploadResult.r2_file_key;
      insertData.thumbnail_url = uploadResult.thumbnail_url;
      insertData.r2_thumbnail_key = uploadResult.r2_thumbnail_key;
    }

    const { data: item, error } = await this.supabaseService
      .getServiceClient()
      .from('gallery_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create item:', error);

      // Cleanup: delete uploaded file
      if (uploadResult.storage_provider === 'cloudflare_images') {
        await this.galleryStorageService.deleteGalleryItem(
          'cloudflare_images',
          uploadResult.cf_image_id,
        );
      } else {
        await this.galleryStorageService.deleteGalleryItem(
          'r2',
          undefined,
          uploadResult.r2_file_key,
        );
      }

      throw new BadRequestException('Failed to create gallery item');
    }

    this.logger.log(`Gallery item created: ${item.id} (provider: ${uploadResult.storage_provider})`);
    return item;
  } catch (error) {
    this.logger.error('Error creating gallery item:', error);
    throw error;
  }
}
```

Update `remove()` method to handle both providers:

```typescript
async remove(id: string, userId: string): Promise<void> {
  try {
    // Fetch item to get storage info
    const { data: existingItem, error: fetchError } = await this.supabaseService
      .getServiceClient()
      .from('gallery_items')
      .select('id, is_deleted, storage_provider, cf_image_id, r2_file_key, r2_thumbnail_key')
      .eq('id', id)
      .single();

    if (fetchError || !existingItem) {
      throw new NotFoundException('Gallery item not found');
    }

    if (existingItem.is_deleted) {
      this.logger.log(`Gallery item ${id} is already deleted`);
      return;
    }

    // Soft delete in database
    const { error } = await this.supabaseService
      .getServiceClient()
      .from('gallery_items')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id);

    if (error) {
      this.logger.error('Failed to delete item:', error);
      throw new BadRequestException('Failed to delete gallery item');
    }

    // Optional: Delete from storage immediately
    // (You can also do this in a background job or keep files for recovery)
    // await this.galleryStorageService.deleteGalleryItem(
    //   existingItem.storage_provider,
    //   existingItem.cf_image_id,
    //   existingItem.r2_file_key,
    // );

    this.logger.log(`Gallery item soft deleted: ${id}`);
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    this.logger.error('Error deleting item:', error);
    throw new BadRequestException('Failed to delete gallery item');
  }
}
```

### 6.4 Update Module

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/src/gallery/gallery.module.ts`

Add the new service to the module:

```typescript
import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryItemsService } from './services/gallery-items.service';
import { GalleryStorageService } from './services/gallery-storage.service';
import { CloudflareImagesService } from './services/cloudflare-images.service';
import { GalleryDownloadLoggerService } from './services/gallery-download-logger.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GalleryController],
  providers: [
    GalleryItemsService,
    GalleryStorageService,
    CloudflareImagesService,
    GalleryDownloadLoggerService,
  ],
  exports: [GalleryItemsService, GalleryStorageService],
})
export class GalleryModule {}
```

---

## 7. Database Schema Updates

### Migration Script

**File**: `core-api-layer/southville-nhs-school-portal-api-layer/gallery_cloudflare_images_migration.sql`

```sql
-- Add new columns for Cloudflare Images support
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'r2',
ADD COLUMN IF NOT EXISTS cf_image_id text,
ADD COLUMN IF NOT EXISTS cf_image_url text;

-- Make R2 fields nullable (for CF Images items)
ALTER TABLE gallery_items
ALTER COLUMN file_url DROP NOT NULL,
ALTER COLUMN r2_file_key DROP NOT NULL;

-- Add check constraint for storage provider
ALTER TABLE gallery_items
ADD CONSTRAINT check_storage_provider
CHECK (storage_provider IN ('cloudflare_images', 'r2'));

-- Add check constraint to ensure required fields based on provider
ALTER TABLE gallery_items
ADD CONSTRAINT check_storage_fields
CHECK (
  (storage_provider = 'cloudflare_images' AND cf_image_id IS NOT NULL AND cf_image_url IS NOT NULL)
  OR
  (storage_provider = 'r2' AND r2_file_key IS NOT NULL)
);

-- Update existing items to explicitly set storage_provider
UPDATE gallery_items
SET storage_provider = 'r2'
WHERE storage_provider IS NULL;

-- Add index for storage provider queries
CREATE INDEX IF NOT EXISTS idx_gallery_items_storage_provider
ON gallery_items(storage_provider);

-- Add index for CF image ID lookups
CREATE INDEX IF NOT EXISTS idx_gallery_items_cf_image_id
ON gallery_items(cf_image_id)
WHERE cf_image_id IS NOT NULL;

-- Add comment to table
COMMENT ON COLUMN gallery_items.storage_provider IS 'Storage provider: cloudflare_images or r2';
COMMENT ON COLUMN gallery_items.cf_image_id IS 'Cloudflare Images ID (for cloudflare_images provider)';
COMMENT ON COLUMN gallery_items.cf_image_url IS 'Cloudflare Images base URL (for cloudflare_images provider)';
```

### How to Run Migration

1. **Backup Database**:
   ```bash
   # Use Supabase dashboard or pg_dump
   pg_dump -h your-db-host -U postgres -d postgres > backup_before_cf_images.sql
   ```

2. **Test in Development First**:
   - Run migration on local/dev database
   - Test all gallery operations
   - Verify new uploads work

3. **Run in Production**:
   - Schedule maintenance window
   - Run migration script
   - Deploy new backend code
   - Monitor for errors

---

## 8. Frontend Updates

### 8.1 Update TypeScript Types

**File**: `frontend-nextjs/lib/api/types/gallery.ts`

```typescript
export interface GalleryItem {
  id: string;
  album_id: string;

  // Storage provider
  storage_provider: 'cloudflare_images' | 'r2';

  // Cloudflare Images fields
  cf_image_id?: string;
  cf_image_url?: string;

  // R2 fields (legacy and videos)
  file_url?: string;
  r2_file_key?: string;
  thumbnail_url?: string;
  r2_thumbnail_key?: string;

  // Common metadata
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  media_type: 'image' | 'video';

  title?: string;
  caption?: string;
  alt_text?: string;
  display_order: number;
  is_featured: boolean;

  photographer_name?: string;
  photographer_credit?: string;
  taken_at?: string;
  location?: string;

  views_count: number;
  downloads_count: number;

  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;

  created_at: string;
  updated_at: string;
  uploaded_by: string;
  updated_by?: string;
}
```

### 8.2 Update Helper Functions

**File**: `frontend-nextjs/lib/utils/gallery.ts`

```typescript
/**
 * Get image URL for a specific variant
 */
export function getImageUrl(
  item: GalleryItem,
  variant: 'thumbnail' | 'card' | 'public' | 'original' = 'public'
): string {
  if (item.storage_provider === 'cloudflare_images' && item.cf_image_url) {
    // Replace the default variant in the URL with the requested variant
    return item.cf_image_url.replace(/\/[^/]+$/, `/${variant}`);
  }

  // Fallback to R2 URLs
  if (variant === 'thumbnail' && item.thumbnail_url) {
    return item.thumbnail_url;
  }

  return item.file_url || '';
}

/**
 * Get thumbnail URL for grid display
 */
export function getThumbnailUrl(item: GalleryItem): string {
  return getImageUrl(item, 'thumbnail');
}

/**
 * Get full-size URL for viewing
 */
export function getFullSizeUrl(item: GalleryItem): string {
  return getImageUrl(item, 'public');
}

/**
 * Get original quality URL for download
 */
export function getDownloadUrl(item: GalleryItem): string {
  return getImageUrl(item, 'original');
}

/**
 * Check if item uses Cloudflare Images
 */
export function isCloudflareImage(item: GalleryItem): boolean {
  return item.storage_provider === 'cloudflare_images';
}
```

### 8.3 Update Gallery Components

**File**: `frontend-nextjs/app/superadmin/gallery/page.tsx`

Update image rendering to use helper functions:

```typescript
import { getThumbnailUrl, getFullSizeUrl } from '@/lib/utils/gallery';

// In the grid display:
<img
  src={getThumbnailUrl(item)}
  alt={item.alt_text || item.title || 'Gallery image'}
  className="w-full h-48 object-cover"
/>

// In the modal/lightbox:
<img
  src={getFullSizeUrl(item)}
  alt={item.alt_text || item.title || 'Gallery image'}
  className="max-w-full max-h-[80vh] object-contain"
/>
```

**File**: `frontend-nextjs/hooks/useGallery.ts`

Update download function to handle both providers:

```typescript
const downloadItem = useCallback(async (id: string): Promise<string | null> => {
  try {
    // For CF Images items, we can use the original variant directly
    const item = items.find(i => i.id === id);

    if (item?.storage_provider === 'cloudflare_images') {
      // No need to generate presigned URL, just use original variant
      return getImageUrl(item, 'original');
    }

    // For R2 items, use the API to generate presigned URL
    const response = await getGalleryItemDownloadUrl(id);
    return response.downloadUrl;
  } catch (error: any) {
    toast({
      title: "Error",
      description: "Failed to generate download link. Please try again.",
      variant: "destructive",
    });
    return null;
  }
}, [items, toast]);
```

---

## 9. Testing Plan

### 9.1 Unit Tests

**Backend Tests**:
- `CloudflareImagesService`:
  - ✅ Upload image successfully
  - ✅ Handle upload errors
  - ✅ Delete image successfully
  - ✅ Build correct image URLs
  - ✅ Detect image file types correctly

- `GalleryStorageService`:
  - ✅ Route images to Cloudflare Images
  - ✅ Route videos to R2
  - ✅ Fallback to R2 on CF Images failure
  - ✅ Delete from correct provider

**Frontend Tests**:
- Helper functions:
  - ✅ `getImageUrl()` returns correct URL for CF Images
  - ✅ `getImageUrl()` falls back to R2 URLs
  - ✅ Variant substitution works correctly

### 9.2 Integration Tests

**Upload Flow**:
1. Upload JPEG image → Verify stored in Cloudflare Images
2. Upload PNG image → Verify stored in Cloudflare Images
3. Upload MP4 video → Verify stored in R2
4. Upload with CF Images disabled → Verify stored in R2

**Display Flow**:
1. Load gallery → Verify both CF Images and R2 items display
2. Click thumbnail → Verify correct variant loads
3. View full size → Verify 'public' variant loads
4. Download → Verify 'original' variant loads

**Edit Flow**:
1. Edit CF Images item metadata → Verify update succeeds
2. Edit R2 item metadata → Verify update succeeds

**Delete Flow**:
1. Delete CF Images item → Verify soft delete in DB
2. Delete R2 item → Verify soft delete in DB
3. Restore deleted items → Verify restoration works for both

### 9.3 Performance Testing

**Metrics to Measure**:
- Image load time (CF Images vs R2)
- Upload time
- Page load time with mixed items
- Bandwidth usage comparison

**Expected Results**:
- CF Images items load 30-50% faster
- Automatic WebP/AVIF reduces bandwidth by 25-40%
- Thumbnail generation is instant (no manual processing)

### 9.4 User Acceptance Testing

**Test Scenarios**:
1. Admin uploads 10 new photos → All appear in gallery
2. Admin uploads 5 videos → All appear in gallery
3. Student views gallery → All images load quickly
4. Student downloads image → Download works
5. Admin deletes and restores items → Works for both providers

---

## 10. Deployment Strategy

### 10.1 Pre-Deployment Checklist

- [ ] Cloudflare Images variants created (thumbnail, card, public, original)
- [ ] Environment variables configured in production
- [ ] Database migration tested in staging
- [ ] Backend code reviewed and tested
- [ ] Frontend code reviewed and tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### 10.2 Deployment Steps

**Step 1: Database Migration** (5 minutes)
```bash
# Run migration script
psql -h production-db -U postgres -d postgres < gallery_cloudflare_images_migration.sql

# Verify migration
psql -h production-db -U postgres -d postgres -c "SELECT storage_provider, COUNT(*) FROM gallery_items GROUP BY storage_provider;"
```

**Step 2: Backend Deployment** (10 minutes)
```bash
cd core-api-layer/southville-nhs-school-portal-api-layer

# With feature flag disabled initially
ENABLE_CLOUDFLARE_IMAGES=false npm run build
npm run deploy

# Verify deployment
curl https://your-api.com/health
```

**Step 3: Frontend Deployment** (5 minutes)
```bash
cd frontend-nextjs

npm run build
npm run deploy

# Verify deployment
curl https://your-frontend.com
```

**Step 4: Enable Feature Flag** (Gradual Rollout)
```bash
# Day 1: Enable for 10% of uploads
ENABLE_CLOUDFLARE_IMAGES=true
# (Add logic to randomly route 10% to CF Images)

# Day 2: Enable for 50% of uploads

# Day 3: Enable for 100% of uploads
```

**Step 5: Monitor and Validate** (Ongoing)
- Check error logs for upload failures
- Monitor Cloudflare Images dashboard for usage
- Verify images display correctly on frontend
- Check performance metrics

### 10.3 Post-Deployment Validation

**Validation Checklist**:
- [ ] New image uploads appear in Cloudflare Images dashboard
- [ ] Gallery displays both old (R2) and new (CF Images) items
- [ ] All image variants load correctly (thumbnail, card, public)
- [ ] Video uploads still work (R2)
- [ ] Download functionality works for both providers
- [ ] Edit/delete operations work for both providers
- [ ] Archive and restore work for both providers
- [ ] No increase in error rates

**Performance Validation**:
- [ ] Average page load time improved or stable
- [ ] Image load times reduced
- [ ] Bandwidth usage reduced
- [ ] Upload success rate ≥99%

---

## 11. Timeline & Milestones

### Week 1: Setup & Development

**Day 1-2: Environment Setup**
- ✅ Obtain Cloudflare credentials
- ✅ Configure environment variables
- Create image variants in dashboard
- Test API access

**Day 3-4: Backend Development**
- Implement `CloudflareImagesService`
- Update `GalleryStorageService`
- Update `GalleryItemsService`
- Write unit tests

**Day 5: Database Migration**
- Create migration script
- Test in local environment
- Test in staging environment
- Document rollback procedure

### Week 2: Testing & Deployment

**Day 1-2: Frontend Development**
- Update TypeScript types
- Create helper functions
- Update gallery components
- Update hooks

**Day 3: Integration Testing**
- Test upload flows
- Test display flows
- Test edit/delete flows
- Performance testing

**Day 4: Staging Deployment**
- Deploy to staging environment
- Run full test suite
- User acceptance testing
- Bug fixes

**Day 5: Production Deployment**
- Deploy database migration
- Deploy backend with feature flag OFF
- Deploy frontend
- Enable feature flag (10% rollout)

### Week 3: Monitoring & Optimization

**Day 1-2: Gradual Rollout**
- Monitor 10% rollout
- Increase to 50%
- Monitor performance
- Address any issues

**Day 3-4: Full Rollout**
- Enable 100% rollout
- Monitor error rates
- Monitor performance metrics
- Optimize as needed

**Day 5: Documentation & Wrap-up**
- Update documentation
- Create runbook for operations
- Post-mortem review
- Celebrate success! 🎉

---

## 12. Rollback Plan

### When to Rollback

Trigger rollback if:
- Error rate increases by >5%
- Upload success rate drops below 95%
- Critical bugs discovered
- Performance degradation >20%
- Cloudflare Images service outage

### Rollback Steps

**Level 1: Disable Feature Flag** (Immediate - 1 minute)
```bash
# Set environment variable
ENABLE_CLOUDFLARE_IMAGES=false

# Restart backend service
pm2 restart api-layer

# All new uploads will use R2
# Existing CF Images items continue to display
```

**Level 2: Rollback Backend Code** (5 minutes)
```bash
# Rollback to previous version
git checkout <previous-commit-hash>
npm run build
npm run deploy

# Or use deployment platform's rollback feature
vercel rollback
# or
heroku releases:rollback v123
```

**Level 3: Rollback Database Migration** (10 minutes)
```sql
-- Remove new columns (data will be lost!)
ALTER TABLE gallery_items
DROP COLUMN IF EXISTS storage_provider,
DROP COLUMN IF EXISTS cf_image_id,
DROP COLUMN IF EXISTS cf_image_url;

-- Restore NOT NULL constraints
ALTER TABLE gallery_items
ALTER COLUMN file_url SET NOT NULL,
ALTER COLUMN r2_file_key SET NOT NULL;

-- Remove constraints
ALTER TABLE gallery_items
DROP CONSTRAINT IF EXISTS check_storage_provider,
DROP CONSTRAINT IF EXISTS check_storage_fields;

-- Remove indexes
DROP INDEX IF EXISTS idx_gallery_items_storage_provider;
DROP INDEX IF EXISTS idx_gallery_items_cf_image_id;
```

**Note**: Level 3 rollback will **delete** any items uploaded to Cloudflare Images. Only use if absolutely necessary.

### Data Recovery

**If items were uploaded to Cloudflare Images**:
1. Export image IDs from database before rollback
2. Download images from Cloudflare Images using API
3. Re-upload to R2 using migration script
4. Update database records

**Recovery Script Example**:
```typescript
// Script to migrate CF Images items back to R2
async function migrateCFImagesToR2() {
  const cfItems = await db.query(`
    SELECT id, cf_image_id, original_filename
    FROM gallery_items
    WHERE storage_provider = 'cloudflare_images'
  `);

  for (const item of cfItems) {
    // Download from CF Images
    const imageUrl = `${CF_IMAGES_BASE_URL}/${CF_ACCOUNT_HASH}/${item.cf_image_id}/original`;
    const imageBuffer = await downloadImage(imageUrl);

    // Upload to R2
    const r2Result = await uploadToR2(imageBuffer, item.original_filename);

    // Update database
    await db.query(`
      UPDATE gallery_items
      SET storage_provider = 'r2',
          file_url = $1,
          r2_file_key = $2,
          cf_image_id = NULL,
          cf_image_url = NULL
      WHERE id = $3
    `, [r2Result.fileUrl, r2Result.fileKey, item.id]);
  }
}
```

---

## Appendix A: Cloudflare Images API Reference

### Upload Image

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1" \
  -H "Authorization: Bearer {api_token}" \
  -F "file=@/path/to/image.jpg" \
  -F 'metadata={"key":"value"}'
```

### Delete Image

```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1/{image_id}" \
  -H "Authorization: Bearer {api_token}"
```

### List Images

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1?page=1&per_page=50" \
  -H "Authorization: Bearer {api_token}"
```

### Image URL Format

```
https://imagedelivery.net/{account_hash}/{image_id}/{variant}

Example:
https://imagedelivery.net/kslzpqjNVD4TQGhwBAY6ew/abc123/public
```

---

## Appendix B: Cost Comparison

### Cloudflare R2 Pricing (Current)

- **Storage**: $0.015 per GB/month
- **Class A Operations** (uploads): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **Egress**: FREE (huge benefit!)

**Example Monthly Cost** (1000 images, 10GB total, 100K views):
- Storage: 10 GB × $0.015 = $0.15
- Uploads: 1000 × $4.50/1M = $0.0045
- Reads: 100K × $0.36/1M = $0.036
- **Total: ~$0.19/month**

### Cloudflare Images Pricing (Target)

- **Storage**: $5 per 100,000 images stored
- **Delivery**: $1 per 100,000 images delivered
- **No charge for variants or transformations**

**Example Monthly Cost** (1000 images, 100K views):
- Storage: 1000 × $5/100K = $0.05
- Delivery: 100K × $1/100K = $1.00
- **Total: ~$1.05/month**

### Cost Analysis

For a school portal with moderate traffic, Cloudflare Images is slightly more expensive but provides:
- Automatic optimization (WebP/AVIF)
- Automatic resizing (no compute costs)
- Faster delivery (better user experience)
- Reduced development time (no manual thumbnail generation)

**Verdict**: The improved user experience and reduced development costs justify the small price increase.

---

## Appendix C: Troubleshooting Guide

### Common Issues

**Issue 1: Upload Fails with "Invalid API Token"**

**Solution**:
- Verify `CLOUDFLARE_IMAGES_API_TOKEN` is correct
- Check token has "Cloudflare Images: Edit" permission
- Regenerate token if needed

**Issue 2: Images Don't Display**

**Solution**:
- Check `cf_image_url` in database
- Verify variant name is correct
- Check browser console for CORS errors
- Verify account hash is correct

**Issue 3: Video Upload Fails**

**Solution**:
- Videos should route to R2, not CF Images
- Check `isImageFile()` logic
- Verify R2 credentials are still valid

**Issue 4: Database Migration Fails**

**Solution**:
- Check for existing column names
- Verify database permissions
- Run migration step by step
- Check constraint conflicts

**Issue 5: Fallback to R2 Not Working**

**Solution**:
- Check try/catch blocks in `uploadToCloudflareImages()`
- Verify R2 credentials are valid
- Check logs for error details

---

## Appendix D: Future Enhancements

### Phase 4 Ideas (Post-Launch)

1. **Background Migration of Existing Images**
   - Script to migrate high-traffic images to CF Images
   - Migrate featured images first
   - Set deadline for full migration

2. **Custom Domain for Images**
   - Configure custom domain (e.g., images.southville8b.edu.ph)
   - Update `CLOUDFLARE_IMAGES_BASE_URL`
   - Better branding and caching

3. **Advanced Variants**
   - Hero images: 1920x1080
   - Social media: 1200x630 (for sharing)
   - Lazy loading placeholders: 50x50

4. **Image Analytics**
   - Track variant usage
   - Monitor bandwidth savings
   - Identify popular images

5. **Progressive Web App (PWA) Integration**
   - Offline image caching
   - Service worker for image optimization
   - Faster perceived performance

6. **AI-Powered Features**
   - Automatic alt text generation
   - Content moderation
   - Smart cropping for thumbnails

---

## Summary

This migration plan provides a comprehensive guide to transitioning from Cloudflare R2 to a hybrid storage approach using Cloudflare Images for photos and R2 for videos. The plan includes:

- ✅ Complete backend implementation with new `CloudflareImagesService`
- ✅ Database schema updates with migration script
- ✅ Frontend updates for seamless display of both providers
- ✅ Comprehensive testing strategy
- ✅ Step-by-step deployment guide with rollback plan
- ✅ 3-week timeline with clear milestones

**Next Steps**:
1. Review and approve this plan
2. Create image variants in Cloudflare dashboard
3. Begin Week 1 implementation
4. Test thoroughly in staging
5. Deploy to production with gradual rollout

**Success Criteria**:
- ✅ All new image uploads use Cloudflare Images
- ✅ All existing R2 images continue to display
- ✅ Page load times improve by 20%+
- ✅ No increase in error rates
- ✅ User experience improves

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Author**: Development Team
**Status**: Ready for Review
