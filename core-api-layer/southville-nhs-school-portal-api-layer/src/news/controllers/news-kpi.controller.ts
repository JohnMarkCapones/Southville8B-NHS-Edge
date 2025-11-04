import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { NewsKpiService } from '../services/news-kpi.service';

@ApiTags('news')
@Controller('news/journalism')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NewsKpiController {
  constructor(private readonly newsKpiService: NewsKpiService) {}

  @Get('kpis')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get journalism team KPIs' })
  @ApiResponse({ status: 200 })
  async getKpis() {
    return this.newsKpiService.getKpis();
  }
}








