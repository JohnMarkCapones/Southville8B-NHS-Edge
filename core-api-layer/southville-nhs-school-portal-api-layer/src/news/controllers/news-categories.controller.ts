import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { NewsCategoriesService } from '../services/news-categories.service';
import { CreateNewsCategoryDto } from '../dto';

/**
 * Controller for news categories
 * Public endpoints for viewing categories
 * Only Advisers can create/update/delete
 */
@ApiTags('news-categories')
@Controller('news-categories')
export class NewsCategoriesController {
  constructor(
    private readonly categoriesService: NewsCategoriesService,
  ) {}

  // ============================================
  // PUBLIC ENDPOINTS (No authentication required)
  // ============================================

  /**
   * Get all categories
   * Public endpoint - no authentication required
   */
  @Get('public')
  @ApiOperation({ summary: 'Get all news categories (public)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAllPublic() {
    return this.categoriesService.findAll();
  }

  /**
   * Get category by slug
   * Public endpoint - no authentication required
   */
  @Get('public/slug/:slug')
  @ApiOperation({ summary: 'Get category by slug (public)' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlugPublic(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Get category by ID
   * Public endpoint - no authentication required
   */
  @Get('public/:id')
  @ApiOperation({ summary: 'Get category by ID (public)' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOnePublic(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS (Advisers only)
  // ============================================

  /**
   * Create a new category
   * Only Advisers and Co-Advisers can create categories
   */
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category (Advisers only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  async create(@Body() createDto: CreateNewsCategoryDto) {
    // Note: Permission check for Adviser/Co-Adviser role should be added
    // in NewsAccessService if needed for finer control
    return this.categoriesService.create(createDto);
  }

  /**
   * Get all categories
   * Authenticated users can see all categories
   */
  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all categories (authenticated)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * Get category by ID
   * Authenticated users can view any category
   */
  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get category by ID (authenticated)' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Update category
   * Only Advisers and Co-Advisers can update categories
   */
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category (Advisers only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateNewsCategoryDto>,
  ) {
    return this.categoriesService.update(id, updateDto);
  }

  /**
   * Delete category
   * Only Advisers and Co-Advisers can delete categories
   */
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (Advisers only)' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }
}
