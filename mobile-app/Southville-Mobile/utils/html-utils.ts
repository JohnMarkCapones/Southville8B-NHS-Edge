/**
 * Simple HTML utility functions for React Native
 * Strips HTML tags and formats basic content
 */

export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags but preserve line breaks
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<b[^>]*>/gi, '**')
    .replace(/<\/b>/gi, '**')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
    .replace(/\n\s*\n/g, '\n\n') // Clean up multiple line breaks
    .trim();
};

export const formatAnnouncementContent = (html: string): string => {
  if (!html) return '';
  
  // For announcements, we want a cleaner format
  return stripHtmlTags(html)
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers for cleaner look
    .replace(/\n{3,}/g, '\n\n') // Limit to max 2 line breaks
    .trim();
};
