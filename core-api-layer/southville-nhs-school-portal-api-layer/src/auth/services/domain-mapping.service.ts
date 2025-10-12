import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface DomainMapping {
  entityType: string;
  tableName: string;
  domainIdColumn: string;
}

/**
 * Service responsible for mapping entity IDs to domain IDs
 * Handles the resolution of domain context from route parameters
 */
@Injectable()
export class DomainMappingService {
  private readonly logger = new Logger(DomainMappingService.name);

  // Registry of entity type mappings to domain lookup logic
  private readonly domainMappings: Map<string, DomainMapping> = new Map([
    [
      'club',
      {
        entityType: 'club',
        tableName: 'clubs',
        domainIdColumn: 'domain_id',
      },
    ],
    [
      'event',
      {
        entityType: 'event',
        tableName: 'events',
        domainIdColumn: 'domain_id',
      },
    ],
    [
      'project',
      {
        entityType: 'project',
        tableName: 'projects',
        domainIdColumn: 'domain_id',
      },
    ],
  ]);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Registers a new domain mapping for an entity type
   * @param entityType - The entity type (e.g., 'club', 'event')
   * @param mapping - The mapping configuration
   */
  registerMapping(entityType: string, mapping: DomainMapping): void {
    this.domainMappings.set(entityType, mapping);
    this.logger.log(`Registered domain mapping for entity type: ${entityType}`);
  }

  /**
   * Resolves domain ID from entity ID and parameter name
   * @param paramName - The route parameter name (e.g., 'clubId', 'eventId')
   * @param entityId - The entity ID value
   * @returns Promise<number | null> - The domain ID or null if not found
   */
  async resolveDomainId(
    paramName: string,
    entityId: string,
  ): Promise<number | null> {
    try {
      // Extract entity type from parameter name (e.g., 'clubId' -> 'club')
      const entityType = this.extractEntityTypeFromParam(paramName);

      if (!entityType) {
        this.logger.warn(
          `Could not extract entity type from parameter: ${paramName}`,
        );
        return null;
      }

      const mapping = this.domainMappings.get(entityType);
      if (!mapping) {
        this.logger.warn(
          `No domain mapping found for entity type: ${entityType}`,
        );
        return null;
      }

      // Query the entity table to get the domain_id
      const supabase = this.supabaseService.getServiceClient();
      const { data, error } = await supabase
        .from(mapping.tableName)
        .select(mapping.domainIdColumn)
        .eq('id', entityId)
        .single();

      if (error) {
        this.logger.error(
          `Error resolving domain ID for ${entityType}:${entityId}`,
          error,
        );
        return null;
      }

      if (!data) {
        this.logger.warn(`Entity not found: ${entityType}:${entityId}`);
        return null;
      }

      const domainId = data[mapping.domainIdColumn];
      this.logger.debug(
        `Resolved domain ID ${domainId} for ${entityType}:${entityId}`,
      );

      return domainId;
    } catch (error) {
      this.logger.error(
        `Failed to resolve domain ID for ${paramName}:${entityId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Extracts entity type from parameter name
   * @param paramName - The parameter name (e.g., 'clubId', 'eventId')
   * @returns string | null - The entity type or null if not found
   */
  private extractEntityTypeFromParam(paramName: string): string | null {
    // Remove 'Id' suffix and convert to lowercase
    if (paramName.endsWith('Id')) {
      return paramName.slice(0, -2).toLowerCase();
    }

    // Handle other common patterns
    const patterns = [
      { pattern: /^(\w+)Id$/, replacement: '$1' },
      { pattern: /^(\w+)_id$/, replacement: '$1' },
    ];

    for (const { pattern, replacement } of patterns) {
      const match = paramName.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    return null;
  }

  /**
   * Gets all registered domain mappings
   * @returns Map<string, DomainMapping> - All registered mappings
   */
  getAllMappings(): Map<string, DomainMapping> {
    return new Map(this.domainMappings);
  }

  /**
   * Checks if a domain mapping exists for the given entity type
   * @param entityType - The entity type to check
   * @returns boolean - Whether the mapping exists
   */
  hasMapping(entityType: string): boolean {
    return this.domainMappings.has(entityType);
  }
}
