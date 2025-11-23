import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  R2StorageService,
  R2ConnectionTest,
} from '../r2-storage/r2-storage.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/decorators/roles.decorator';

@ApiTags('R2 Health Check')
@Controller('r2-health')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class R2HealthController {
  constructor(private readonly r2StorageService: R2StorageService) {}

  @Get('status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check R2 connection status',
    description: 'Performs comprehensive R2 connectivity and permission tests',
  })
  @ApiResponse({
    status: 200,
    description: 'R2 connection status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isConnected: { type: 'boolean' },
        bucketExists: { type: 'boolean' },
        canUpload: { type: 'boolean' },
        canDownload: { type: 'boolean' },
        canDelete: { type: 'boolean' },
        bucketName: { type: 'string' },
        endpoint: { type: 'string' },
        errors: { type: 'array', items: { type: 'string' } },
        testResults: {
          type: 'object',
          properties: {
            configuration: { type: 'boolean' },
            bucketAccess: { type: 'boolean' },
            uploadTest: { type: 'boolean' },
            downloadTest: { type: 'boolean' },
            deleteTest: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getConnectionStatus(): Promise<R2ConnectionTest> {
    return this.r2StorageService.testConnection();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Run comprehensive R2 connection test',
    description:
      'Executes full R2 connectivity test including upload, download, and delete operations',
  })
  @ApiResponse({
    status: 200,
    description: 'R2 connection test completed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 500, description: 'R2 connection test failed' })
  async runConnectionTest(): Promise<R2ConnectionTest> {
    return this.r2StorageService.testConnection();
  }

  @Get('bucket-info')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get R2 bucket information',
    description:
      'Retrieves basic information about the R2 bucket including object count and sample files',
  })
  @ApiResponse({
    status: 200,
    description: 'Bucket information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        bucketName: { type: 'string' },
        endpoint: { type: 'string' },
        region: { type: 'string' },
        objectCount: { type: 'number' },
        sampleObjects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              size: { type: 'number' },
              lastModified: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve bucket information',
  })
  async getBucketInfo(): Promise<any> {
    return this.r2StorageService.getBucketInfo();
  }

  @Get('config')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get R2 configuration (without sensitive data)',
    description:
      'Returns R2 configuration details excluding sensitive credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'R2 configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        bucketName: { type: 'string' },
        region: { type: 'string' },
        endpoint: { type: 'string' },
        maxFileSize: { type: 'number' },
        allowedMimeTypes: { type: 'array', items: { type: 'string' } },
        presignedUrlExpiration: { type: 'number' },
        cacheControl: { type: 'string' },
        enableCdn: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getConfig(): Promise<any> {
    const config = this.r2StorageService['config'];
    return {
      bucketName: config.bucketName,
      region: config.region,
      endpoint: config.endpoint,
      maxFileSize: config.maxFileSize,
      allowedMimeTypes: config.allowedMimeTypes,
      presignedUrlExpiration: config.presignedUrlExpiration,
      cacheControl: config.cacheControl,
      enableCdn: config.enableCdn,
    };
  }
}
