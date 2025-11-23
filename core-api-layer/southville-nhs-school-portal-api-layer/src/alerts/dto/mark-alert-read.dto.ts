import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for marking an alert as read
 * Empty body is acceptable - the alert ID and user ID come from the route and auth context
 */
export class MarkAlertReadDto {
  // Empty DTO - just using it for validation and documentation
  // The actual data comes from:
  // - alertId from route parameter
  // - userId from authentication context
}
