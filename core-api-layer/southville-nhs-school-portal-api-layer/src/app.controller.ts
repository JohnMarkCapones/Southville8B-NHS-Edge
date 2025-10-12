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
    try {
      // Test Supabase connection
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('_health_check')
        .select('*')
        .limit(1);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supabase: error ? 'disconnected' : 'connected',
        error: error?.message || null,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        supabase: 'error',
        error: error.message,
      };
    }
  }
}
