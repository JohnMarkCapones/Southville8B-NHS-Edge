import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';

/**
 * Pipe to validate permission key format
 * Ensures permission keys follow the pattern: 'domain.action'
 */
@Injectable()
export class PermissionValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Only validate string values
    if (typeof value !== 'string') {
      return value;
    }

    // Check if it's a permission key (contains dot)
    if (value.includes('.')) {
      const parts = value.split('.');

      // Check for multiple dots
      if (parts.length > 2) {
        throw new BadRequestException(
          'Invalid permission format. Expected format: "domain.action" (e.g., "club.manage_finances")',
        );
      }

      const [domain, action] = parts;

      if (!domain || !action) {
        throw new BadRequestException(
          'Invalid permission format. Expected format: "domain.action" (e.g., "club.manage_finances")',
        );
      }

      // Validate domain and action format
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(domain)) {
        throw new BadRequestException(
          'Invalid domain format. Domain must start with a letter and contain only letters, numbers, and underscores',
        );
      }

      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(action)) {
        throw new BadRequestException(
          'Invalid action format. Action must start with a letter and contain only letters, numbers, and underscores',
        );
      }
    }

    return value;
  }
}
