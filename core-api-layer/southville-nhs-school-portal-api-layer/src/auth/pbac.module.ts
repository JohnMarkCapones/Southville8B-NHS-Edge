import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { PolicyEngineService } from './services/policy-engine.service';
import { DomainMappingService } from './services/domain-mapping.service';
import { PbacManagementService } from './services/pbac-management.service';
import { PoliciesGuard } from './guards/policies.guard';

/**
 * PBAC (Policy-Based Access Control) Module
 * Provides domain-specific permission evaluation capabilities
 *
 * Components:
 * - PolicyEngineService: Core permission evaluation logic
 * - DomainMappingService: Maps entity IDs to domain IDs
 * - PbacManagementService: CRUD operations for PBAC data
 * - PoliciesGuard: Guard for route-level permission checking
 * - Entities: Type-safe database models for PBAC tables
 */
@Module({
  imports: [SupabaseModule],
  providers: [
    PolicyEngineService,
    DomainMappingService,
    PbacManagementService,
    PoliciesGuard,
  ],
  exports: [
    PolicyEngineService,
    DomainMappingService,
    PbacManagementService,
    PoliciesGuard,
  ],
})
export class PbacModule {}
