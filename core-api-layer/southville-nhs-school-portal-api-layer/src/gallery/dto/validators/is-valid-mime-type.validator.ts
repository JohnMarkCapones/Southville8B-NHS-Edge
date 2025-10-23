import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Allowed MIME types for gallery uploads
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // MOV
  'video/webm',
];

export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
];

/**
 * Custom validator constraint for MIME type validation
 */
@ValidatorConstraint({ name: 'isValidMimeType', async: false })
export class IsValidMimeTypeConstraint implements ValidatorConstraintInterface {
  validate(mimeType: string): boolean {
    if (!mimeType) {
      return false;
    }
    return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  defaultMessage(): string {
    return `File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`;
  }
}

/**
 * Decorator to validate MIME type
 * @param validationOptions - Standard class-validator options
 */
export function IsValidMimeType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidMimeTypeConstraint,
    });
  };
}

/**
 * Helper function to check if MIME type is valid
 */
export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType?.toLowerCase());
}

/**
 * Helper function to get media type from MIME type
 */
export function getMediaTypeFromMimeType(
  mimeType: string,
): 'image' | 'video' | null {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(mimeType?.toLowerCase())) {
    return 'image';
  }
  if (ALLOWED_VIDEO_MIME_TYPES.includes(mimeType?.toLowerCase())) {
    return 'video';
  }
  return null;
}
