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
 * Build flexible variant URL with custom dimensions and quality
 * @param imageId - Cloudflare Images ID
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100, default 90)
 * @returns Flexible variant URL with high quality
 */
export function buildFlexibleUrl(
  imageId: string,
  width: number,
  quality: number = 90
): string {
  return `${CLOUDFLARE_IMAGES_BASE_URL}/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/width=${width},quality=${quality},format=auto`;
}

/**
 * Check if item uses Cloudflare Images (has valid cf_image_id)
 * @param item - Gallery item
 * @returns true if item uses Cloudflare Images
 */
export function usesCloudflareImages(item: GalleryItem): boolean {
  return Boolean(item.cf_image_id && item.cf_image_id.trim().length > 0);
}

/**
 * Get thumbnail URL (400x400) for grid display with high quality
 * @param item - Gallery item
 * @returns Thumbnail image URL
 */
export function getThumbnailUrl(item: GalleryItem): string {
  // If using Cloudflare Images, use the public variant
  if (usesCloudflareImages(item)) {
    const url = buildImageUrl(item.cf_image_id, 'public');
    console.log('[getThumbnailUrl] CF Images ID:', item.cf_image_id, '-> URL:', url);
    return url;
  }

  // Fallback to legacy cf_image_url field for old data
  const fallbackUrl = item.cf_image_url || '/placeholder.svg';
  console.log('[getThumbnailUrl] Using fallback:', fallbackUrl, 'CF ID:', item.cf_image_id);
  return fallbackUrl;
}

/**
 * Get card URL (800px wide) for card/preview display with high quality
 * @param item - Gallery item
 * @returns Card image URL
 */
export function getCardUrl(item: GalleryItem): string {
  // If using Cloudflare Images, use the public variant
  if (usesCloudflareImages(item)) {
    return buildImageUrl(item.cf_image_id, 'public');
  }

  // Fallback to legacy cf_image_url field for old data
  return item.cf_image_url || '/placeholder.svg';
}

/**
 * Get public URL (1600px wide) for full-size viewing with maximum quality
 * @param item - Gallery item
 * @returns Public image URL
 */
export function getPublicUrl(item: GalleryItem): string {
  // If using Cloudflare Images, use the public variant
  if (usesCloudflareImages(item)) {
    return buildImageUrl(item.cf_image_id, 'public');
  }

  // Fallback to legacy cf_image_url field for old data
  return item.cf_image_url || '/placeholder.svg';
}

/**
 * Get original URL (original quality) for downloads
 * @param item - Gallery item
 * @returns Original image URL with maximum quality
 */
export function getOriginalUrl(item: GalleryItem): string {
  // If using Cloudflare Images, use the public variant
  if (usesCloudflareImages(item)) {
    return buildImageUrl(item.cf_image_id, 'public');
  }

  // Fallback to legacy cf_image_url field for old data
  return item.cf_image_url || '/placeholder.svg';
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
 * Check if URL is a presigned URL that needs bypass Next.js optimization
 * @param url - Image URL to check
 * @returns true if URL is a presigned/temporary URL
 */
export function isPresignedUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('X-Amz-Algorithm') ||
    url.includes('X-Amz-Signature') ||
    url.includes('%3FX-Amz-') ||
    url.includes('r2.cloudflarestorage.com') ||
    url.includes('x-id=GetObject')
  );
}

/**
 * Check if item needs unoptimized rendering (legacy URLs or presigned URLs)
 * @param item - Gallery item
 * @returns true if Next.js image optimization should be bypassed
 */
export function needsUnoptimized(item: GalleryItem): boolean {
  // If not using Cloudflare Images, check if legacy URL needs bypass
  if (!usesCloudflareImages(item)) {
    return isPresignedUrl(item.cf_image_url);
  }
  return false;
}

/**
 * Get responsive image srcset for <img> tag with high quality variants
 * @param item - Gallery item
 * @returns srcset string with multiple high-quality variants
 */
export function getResponsiveSrcSet(item: GalleryItem): string {
  // Only generate srcset for Cloudflare Images
  if (!usesCloudflareImages(item)) {
    return '';
  }

  return [
    `${getThumbnailUrl(item)} 400w`,
    `${getCardUrl(item)} 800w`,
    `${getPublicUrl(item)} 1600w`,
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
