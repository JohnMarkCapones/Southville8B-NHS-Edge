import { SetMetadata } from '@nestjs/common';

export interface PolicyConfig {
  domainParam: string;
  permissionKey: string;
}

export const POLICIES_KEY = 'policies';

/**
 * Decorator to specify domain-specific permission requirements for a route
 * @param domainParam - The route parameter name that contains the domain entity ID (e.g., 'clubId', 'eventId')
 * @param permissionKey - The permission key to check (e.g., 'club.manage_finances', 'event.edit_details')
 * @returns Decorator function
 *
 * @example
 * ```typescript
 * @Patch(':clubId/finances')
 * @Policies('clubId', 'club.manage_finances')
 * async updateClubFinances(@Param('clubId') clubId: string) {
 *   // Implementation
 * }
 * ```
 */
export const Policies = (domainParam: string, permissionKey: string) =>
  SetMetadata(POLICIES_KEY, { domainParam, permissionKey } as PolicyConfig);
