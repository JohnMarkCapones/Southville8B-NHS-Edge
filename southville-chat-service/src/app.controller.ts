import { Controller, Get, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @Version(['1', '']) // Support both /api/v1/health and /api/health
  @ApiOperation({
    summary: 'Check application health',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-01-10T18:05:34.000Z' },
      },
    },
  })
  getHealth() {
    // Ultra-fast health check for Render - return immediately
    // Render's health check times out quickly, so we return instantly
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

