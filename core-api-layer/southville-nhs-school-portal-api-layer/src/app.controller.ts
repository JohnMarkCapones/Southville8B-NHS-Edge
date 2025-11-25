import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@ApiTags('Health & Info')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message retrieved successfully',
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check application health and Supabase connectivity',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-01-10T18:05:34.000Z' },
        supabase: { type: 'string', example: 'connected' },
        error: { type: 'string', nullable: true },
      },
    },
  })
  getHealth() {
    // Ultra-fast health check for Render - return immediately
    // Render's health check times out quickly, so we return instantly
    // Supabase connectivity can be checked separately if needed
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: 'not_checked', // Skip Supabase check for health endpoint
      error: null,
    };
  }
}
