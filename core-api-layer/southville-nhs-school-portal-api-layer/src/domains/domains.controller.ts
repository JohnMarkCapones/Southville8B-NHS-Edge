import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { DomainsService } from './domains.service';
import { CreateDomainDto, CreateClubDomainDto } from './dto/create-domain.dto';

@ApiTags('domains')
@Controller('domains')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new domain' })
  @ApiResponse({ status: 201, description: 'Domain created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDomainDto: CreateDomainDto, @Request() req) {
    return this.domainsService.create(createDomainDto, req.user.id);
  }

  @Post('clubs')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create a club domain with associated club',
    description:
      'Creates both a domain (type: club) and a club record linked to that domain. Also creates default domain roles and permissions.',
  })
  @ApiResponse({ status: 201, description: 'Club domain created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createClubDomain(
    @Body() createClubDomainDto: CreateClubDomainDto,
    @Request() req,
  ) {
    return this.domainsService.createClubDomain(
      createClubDomainDto,
      req.user.id,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({ status: 200, description: 'Domains retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.domainsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get domain by ID' })
  @ApiResponse({ status: 200, description: 'Domain retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  @Get(':id/roles')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all domain roles for a specific domain' })
  @ApiResponse({
    status: 200,
    description: 'Domain roles retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDomainRoles(@Param('id') id: string) {
    return this.domainsService.getDomainRoles(id);
  }
}
