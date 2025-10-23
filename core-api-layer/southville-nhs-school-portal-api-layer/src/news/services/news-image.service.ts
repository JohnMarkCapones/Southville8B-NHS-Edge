import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * Service for handling image-related operations in news articles
 * Extracts images from HTML, validates featured images, etc.
 */
@Injectable()
export class NewsImageService {
  private readonly logger = new Logger(NewsImageService.name);

  /**
   * Extract first image URL from HTML content
   * Used for auto-setting featured image if user doesn't provide one
   * @param html Article HTML content
   * @returns string | null - First image URL or null if no images found
   */
  extractFirstImage(html: string): string | null {
    if (!html) return null;

    // Regex to find first <img> tag's src attribute
    // Matches: <img src="url" ...> or <img ... src="url" ...>
    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/i;
    const match = html.match(imgRegex);

    if (match && match[1]) {
      const imageUrl = match[1];
      this.logger.debug(`Extracted first image from HTML: ${imageUrl}`);
      return imageUrl;
    }

    this.logger.debug('No images found in HTML content');
    return null;
  }

  /**
   * Extract all image URLs from HTML content
   * @param html Article HTML content
   * @returns string[] - Array of image URLs
   */
  extractAllImages(html: string): string[] {
    if (!html) return [];

    const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/gi;
    const images: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    this.logger.debug(`Extracted ${images.length} images from HTML`);
    return images;
  }

  /**
   * Auto-generate description from HTML content
   * Takes first 200 characters of text (strips HTML tags)
   * @param html Article HTML content
   * @param maxLength Maximum description length (default 200)
   * @returns string - Generated description
   */
  generateDescriptionFromHtml(html: string, maxLength: number = 200): string {
    if (!html) return '';

    // Strip HTML tags
    const textOnly = html
      .replace(/<[^>]*>/g, ' ') // Replace tags with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    // Take first maxLength characters
    if (textOnly.length <= maxLength) {
      return textOnly;
    }

    // Cut at last complete word before maxLength
    const truncated = textOnly.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Validate featured image
   * If user provides featured image, use it
   * If not, extract from article HTML
   * If no images at all, throw error (required)
   * @param featuredImageUrl User-provided featured image URL (optional)
   * @param articleHtml Article HTML content
   * @returns string - Featured image URL
   * @throws BadRequestException if no images found
   */
  validateAndGetFeaturedImage(
    featuredImageUrl: string | undefined,
    articleHtml: string,
  ): string {
    // If user provided featured image, use it
    if (featuredImageUrl && featuredImageUrl.trim()) {
      this.logger.debug('Using user-provided featured image');
      return featuredImageUrl.trim();
    }

    // Extract first image from article
    const firstImage = this.extractFirstImage(articleHtml);

    if (!firstImage) {
      throw new BadRequestException(
        'Article must have at least one image. Either upload a featured image or add an image to your article content.',
      );
    }

    this.logger.debug('Using first article image as featured image');
    return firstImage;
  }

  /**
   * Validate image URL format
   * Checks if URL looks valid (basic validation)
   * @param url Image URL
   * @returns boolean
   */
  isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Check if URL starts with http:// or https://
    const urlPattern = /^https?:\/\/.+/i;

    // Check if URL ends with common image extensions
    const imageExtPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

    return urlPattern.test(url) && imageExtPattern.test(url);
  }

  /**
   * Count images in HTML
   * @param html Article HTML content
   * @returns number
   */
  countImages(html: string): number {
    return this.extractAllImages(html).length;
  }
}
