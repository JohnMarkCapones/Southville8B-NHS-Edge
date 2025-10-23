import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator constraint for slug validation
 * Slugs must be lowercase, alphanumeric with hyphens only
 */
@ValidatorConstraint({ name: 'isValidSlug', async: false })
export class IsValidSlugConstraint implements ValidatorConstraintInterface {
  validate(slug: string): boolean {
    if (!slug) {
      return false;
    }
    // Must match: lowercase letters, numbers, and hyphens only
    // Cannot start or end with hyphen
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return slugPattern.test(slug);
  }

  defaultMessage(): string {
    return 'Slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen';
  }
}

/**
 * Decorator to validate slug format
 * @param validationOptions - Standard class-validator options
 */
export function IsValidSlug(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSlugConstraint,
    });
  };
}

/**
 * Helper function to generate slug from title
 * @param title - Original title string
 * @returns URL-friendly slug
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Helper function to ensure slug uniqueness by appending counter
 * @param baseSlug - Base slug to make unique
 * @param counter - Counter to append
 * @returns Unique slug with counter
 */
export function makeSlugUnique(baseSlug: string, counter: number): string {
  return `${baseSlug}-${counter}`;
}
