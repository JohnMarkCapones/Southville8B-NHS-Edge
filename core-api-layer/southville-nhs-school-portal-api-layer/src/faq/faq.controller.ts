import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('FAQ')
@Controller('faq')
export class FaqController {
  private readonly logger = new Logger(FaqController.name);

  constructor(private readonly faqService: FaqService) {}

  // ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

  @Get()
  @ApiOperation({ summary: 'Get all FAQs (Public)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in questions and answers',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQs retrieved successfully',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    this.logger.log('Fetching FAQs (public)');
    return this.faqService.findAll({ page, limit, search });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search FAQs (Public)' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(@Query('q') query: string) {
    this.logger.log(`Searching FAQs with query: ${query}`);
    return this.faqService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'FAQ retrieved successfully',
    type: Faq,
  })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching FAQ ${id} (public)`);
    return this.faqService.findOne(id);
  }

  // ==================== ADMIN ENDPOINTS (Auth Required) ====================

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create FAQ (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'FAQ created successfully',
    type: Faq,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  async create(
    @Body() createFaqDto: CreateFaqDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Creating FAQ for user: ${user.email} (${user.id})`);
    return this.faqService.create(createFaqDto);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update FAQ (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'FAQ updated successfully',
    type: Faq,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Updating FAQ ${id} for user: ${user.email} (${user.id})`);
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete FAQ (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'FAQ deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    this.logger.log(`Deleting FAQ ${id} for user: ${user.email} (${user.id})`);
    await this.faqService.remove(id);
    return { message: 'FAQ deleted successfully' };
  }
}
