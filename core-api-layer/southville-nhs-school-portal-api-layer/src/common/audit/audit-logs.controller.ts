import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseEnumPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { SearchAuditLogsDto } from './dto/search-audit-logs.dto';
import { AuditEntityType } from './audit.types';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN) // Only admins can view audit logs
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search audit logs with filters',
    description:
      'Retrieve audit logs with optional filters for entity type, action, actor, and date range. Supports pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              action: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE'] },
              entity_type: { type: 'string' },
              entity_id: { type: 'string' },
              entity_description: { type: 'string' },
              actor_name: { type: 'string' },
              changed_fields: { type: 'array', items: { type: 'string' } },
              ip_address: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async searchAuditLogs(
    @Query(ValidationPipe) searchDto: SearchAuditLogsDto,
  ) {
    const { data, total } = await this.auditService.searchAuditLogs({
      entityType: searchDto.entityType,
      action: searchDto.action,
      actorUserId: searchDto.actorUserId,
      startDate: searchDto.startDate ? new Date(searchDto.startDate) : undefined,
      endDate: searchDto.endDate ? new Date(searchDto.endDate) : undefined,
      limit: searchDto.limit,
      offset: searchDto.offset,
    });

    return {
      data,
      total,
      limit: searchDto.limit,
      offset: searchDto.offset,
    };
  }

  @Get('entity/:entityType/:entityId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit trail for a specific entity',
    description:
      'Retrieve the complete audit history for a specific entity by type and ID',
  })
  @ApiParam({
    name: 'entityType',
    enum: AuditEntityType,
    description: 'Type of entity',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of audit entries to return',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Entity audit trail retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getEntityAuditTrail(
    @Param('entityType', new ParseEnumPipe(AuditEntityType))
    entityType: AuditEntityType,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: number,
  ) {
    const auditTrail = await this.auditService.getEntityAuditTrail(
      entityType,
      entityId,
      limit || 50,
    );

    return {
      entityType,
      entityId,
      auditTrail,
      count: auditTrail.length,
    };
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit log statistics',
    description:
      'Retrieve aggregated statistics about audit logs for the past N days',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to include in statistics',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byAction: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        byEntity: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        uniqueActors: { type: 'number' },
        period: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAuditStatistics(@Query('days') days?: number) {
    const daysPeriod = days || 30;
    const statistics = await this.auditService.getAuditStatistics(daysPeriod);

    return {
      ...statistics,
      period: `${daysPeriod} days`,
    };
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Export audit logs as CSV',
    description:
      'Export filtered audit logs in CSV format for external analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV export ready',
    content: {
      'text/csv': {
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async exportAuditLogs(@Query(ValidationPipe) searchDto: SearchAuditLogsDto) {
    const { data } = await this.auditService.searchAuditLogs({
      entityType: searchDto.entityType,
      action: searchDto.action,
      actorUserId: searchDto.actorUserId,
      startDate: searchDto.startDate ? new Date(searchDto.startDate) : undefined,
      endDate: searchDto.endDate ? new Date(searchDto.endDate) : undefined,
      limit: searchDto.limit || 1000, // Higher limit for exports
      offset: searchDto.offset,
    });

    // Convert to CSV format
    const csv = this.convertToCSV(data);

    return {
      format: 'csv',
      data: csv,
      count: data.length,
      filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
    };
  }

  /**
   * Convert audit log data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) {
      return '';
    }

    // CSV headers
    const headers = [
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Description',
      'Actor Name',
      'Actor Role',
      'Changed Fields',
      'IP Address',
    ];

    // CSV rows
    const rows = data.map((log) => [
      log.created_at,
      log.action,
      log.entity_type,
      log.entity_id,
      log.entity_description || '',
      log.actor_name || 'System',
      log.actor_role || '',
      Array.isArray(log.changed_fields) ? log.changed_fields.join('; ') : '',
      log.ip_address || '',
    ]);

    // Combine headers and rows
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ];

    return csvLines.join('\n');
  }
}
