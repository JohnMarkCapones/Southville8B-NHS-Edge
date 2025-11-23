import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLogsController } from './audit-logs.controller';
import { AuthModule } from '../../auth/auth.module';

/**
 * Global Audit Module
 *
 * This module provides system-wide audit logging capabilities.
 * It's marked as @Global() so it can be used across all modules without re-importing.
 *
 * Usage in controllers:
 * ```typescript
 * import { Audit } from '@common/audit';
 * import { AuditEntityType } from '@common/audit/audit.types';
 *
 * @Audit({
 *   entityType: AuditEntityType.NEWS,
 *   descriptionField: 'title'
 * })
 * @Post()
 * async create(@Body() dto: CreateNewsDto) {
 *   return this.newsService.create(dto);
 * }
 * ```
 *
 * Manual logging in services:
 * ```typescript
 * constructor(private auditService: AuditService) {}
 *
 * async someMethod() {
 *   await this.auditService.logCreate(
 *     AuditEntityType.NEWS,
 *     newsEntity,
 *     { actorUserId: user.id, actorName: user.full_name }
 *   );
 * }
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  controllers: [AuditLogsController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
