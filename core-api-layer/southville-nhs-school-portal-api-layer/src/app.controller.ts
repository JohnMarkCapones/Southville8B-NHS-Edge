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
  async getHealth() {
    // Fast health check - don't block on Supabase for Render's health checks
    // Render expects a quick response (usually < 5 seconds)
    const healthCheck: {
      status: string;
      timestamp: string;
      supabase: string;
      error: string | null;
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: 'checking',
      error: null,
    };

    // Test Supabase connection asynchronously with timeout
    try {
      const supabase = this.supabaseService.getClient();
      const supabaseCheck = Promise.resolve(
        supabase
          .from('users')
          .select('id')
          .limit(1)
          .then(({ error }) => {
            healthCheck.supabase = error ? 'disconnected' : 'connected';
            healthCheck.error = error?.message || null;
          }),
      ).catch(() => {
        healthCheck.supabase = 'error';
      });

      // Wait max 2 seconds for Supabase check, then return
      await Promise.race([
        supabaseCheck,
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error: any) {
      healthCheck.supabase = 'error';
      healthCheck.error = error?.message || 'Unknown error';
    }

    return healthCheck;
  }
}
