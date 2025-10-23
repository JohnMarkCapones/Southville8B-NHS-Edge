import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom URL validator that uses native JavaScript URL constructor
 * to avoid the validator.js vulnerability (CVE-2025-56200)
 *
 * This validator provides more accurate URL validation that aligns
 * with browser parsing behavior, preventing URL validation bypass attacks.
 */
@ValidatorConstraint({ name: 'isSafeUrl', async: false })
export class IsSafeUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments): boolean {
    if (typeof url !== 'string') {
      return false;
    }

    try {
      // Use native URL constructor for validation
      // This provides more accurate validation than validator.js
      const urlObj = new URL(url);

      // Additional security checks
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      // Ensure the URL has a valid hostname
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        return false;
      }

      // Prevent localhost and private IP addresses in production
      // (optional - can be configured based on environment)
      const privateHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

      if (privateHostnames.includes(urlObj.hostname.toLowerCase())) {
        return false;
      }

      // Check for private IP ranges (basic check)
      const privateIpPattern =
        /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
      if (privateIpPattern.test(urlObj.hostname)) {
        return false;
      }

      return true;
    } catch (error) {
      // URL constructor throws error for invalid URLs
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid HTTPS or HTTP URL`;
  }
}

/**
 * Decorator for safe URL validation
 *
 * @param validationOptions - Optional validation options
 * @returns Property decorator
 *
 * @example
 * ```typescript
 * class CreateEventDto {
 *   @IsSafeUrl()
 *   bannerUrl?: string;
 * }
 * ```
 */
export function IsSafeUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeUrlConstraint,
    });
  };
}
