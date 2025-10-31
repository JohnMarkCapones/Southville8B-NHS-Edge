/**
 * ========================================
 * CLOUDFLARE IMAGES UTILITIES
 * ========================================
 * Helper functions for working with Cloudflare Images
 */

import { GalleryItem } from '@/lib/api/types/gallery';

/**
 * Cloudflare Images variant types
 */
export type ImageVariant = 'thumbnail' | 'card' | 'public' | 'original';

/**
 * Cloudflare Images configuration
 */
const CLOUDFLARE_IMAGES_BASE_URL = 'https://imagedelivery.net';
const CLOUDFLARE_ACCOUNT_HASH = 'kslzpqjNVD4TQGhwBAY6ew';

/**
 * Build Cloudflare Images URL for a specific variant
 * @param imageId - Cloudflare Images ID
 * @param variant - Image variant (thumbnail, card, public, original)
 * @returns Full URL to the image variant
 */
export function buildImageUrl(
  imageId: string,
  variant: ImageVariant = 'public'
): string {
  return `${CLOUDFLARE_IMAGES_BASE_URL}/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/${variant}`;
}

/**
 * Get thumbnail URL (200x200) for grid display
 * @param item - Gallery item
 * @returns Thumbnail image URL
 */
export function getThumbnailUrl(item: GalleryItem): string {
  return buildImageUrl(item.cf_image_id, 'thumbnail');
}

/**
 * Get card URL (600x400) for card/preview display
 * @param item - Gallery item
 * @returns Card image URL
 */
export function getCardUrl(item: GalleryItem): string {
  return buildImageUrl(item.cf_image_id, 'card');
}

/**
 * Get public URL (1200x1200) for full-size viewing
 * @param item - Gallery item
 * @returns Public image URL
 */
export function getPublicUrl(item: GalleryItem): string {
  return buildImageUrl(item.cf_image_id, 'public');
}

/**
 * Get original URL (original quality) for downloads
 * @param item - Gallery item
 * @returns Original image URL
 */
export function getOriginalUrl(item: GalleryItem): string {
  return buildImageUrl(item.cf_image_id, 'original');
}

/**
 * Get image URL with automatic variant selection based on context
 * @param item - Gallery item
 * @param context - Display context (grid, card, lightbox, download)
 * @returns Appropriate image URL for the context
 */
export function getImageUrl(
  item: GalleryItem,
  context: 'grid' | 'card' | 'lightbox' | 'download' = 'card'
): string {
  switch (context) {
    case 'grid':
      return getThumbnailUrl(item);
    case 'card':
      return getCardUrl(item);
    case 'lightbox':
      return getPublicUrl(item);
    case 'download':
      return getOriginalUrl(item);
    default:
      return getCardUrl(item);
  }
}

/**
 * Get all variant URLs for an image
 * @param item - Gallery item
 * @returns Object with all variant URLs
 */
export function getAllVariantUrls(item: GalleryItem): Record<ImageVariant, string> {
  return {
    thumbnail: getThumbnailUrl(item),
    card: getCardUrl(item),
    public: getPublicUrl(item),
    original: getOriginalUrl(item),
  };
}

/**
 * Get responsive image srcset for <img> tag
 * @param item - Gallery item
 * @returns srcset string with multiple variants
 */
export function getResponsiveSrcSet(item: GalleryItem): string {
  return [
    `${getThumbnailUrl(item)} 200w`,
    `${getCardUrl(item)} 600w`,
    `${getPublicUrl(item)} 1200w`,
  ].join(', ');
}

/**
 * Get appropriate sizes attribute for responsive images
 * @returns sizes string for common layouts
 */
export function getResponsiveSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Format file size to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if item is an image (vs video)
 * @param item - Gallery item
 * @returns true if item is an image
 */
export function isImage(item: GalleryItem): boolean {
  return item.media_type === 'image';
}

/**
 * Get image alt text with fallback
 * @param item - Gallery item
 * @returns Alt text for accessibility
 */
export function getImageAltText(item: GalleryItem): string {
  return item.alt_text || item.title || item.caption || 'Gallery image';
}
