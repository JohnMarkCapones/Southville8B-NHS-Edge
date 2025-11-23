import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GalleryTagsService } from '../services/gallery-tags.service';
import { GalleryTag } from '../entities';
import { CreateTagDto, UpdateTagDto, AddTagsToItemDto } from '../dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';

/**
 * Gallery Tags Controller
 * Manages tags for categorizing gallery items
 */
@ApiTags('Gallery')
@Controller('gallery/tags')
export class GalleryTagsController {
  constructor(private readonly galleryTagsService: GalleryTagsService) {}

  /**
   * Create a new tag
   */
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created', type: GalleryTag })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Tag already exists' })
  async create(
    @Body() createTagDto: CreateTagDto,
    @AuthUser() user: any,
  ): Promise<GalleryTag> {
    return this.galleryTagsService.create(createTagDto, user.id);
  }

  /**
   * Get all tags
   */
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['usage_count', 'name'],
    example: 'usage_count',
  })
  @ApiResponse({ status: 200, description: 'List of tags', type: [GalleryTag] })
  async findAll(
    @Query('sortBy') sortBy?: 'usage_count' | 'name',
  ): Promise<GalleryTag[]> {
    return this.galleryTagsService.findAll(sortBy);
  }

  /**
   * Get tag by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag details', type: GalleryTag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GalleryTag> {
    return this.galleryTagsService.findOne(id);
  }

  /**
   * Get tag by slug
   */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiResponse({ status: 200, description: 'Tag', type: GalleryTag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findBySlug(@Param('slug') slug: string): Promise<GalleryTag> {
    return this.galleryTagsService.findBySlug(slug);
  }

  /**
   * Update a tag
   */
  @Put(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated', type: GalleryTag })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<GalleryTag> {
    return this.galleryTagsService.update(id, updateTagDto);
  }

  /**
   * Delete a tag
   */
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 204, description: 'Tag deleted' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.galleryTagsService.remove(id);
  }

  /**
   * Add tags to an item
   */
  @Post('items/:itemId/tags')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add tags to an item' })
  @ApiParam({ name: 'itemId', description: 'Gallery item ID' })
  @ApiResponse({ status: 204, description: 'Tags added' })
  @ApiResponse({ status: 404, description: 'Item or tag not found' })
  async addTagsToItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() addTagsToItemDto: AddTagsToItemDto,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.galleryTagsService.addTagsToItem(
      itemId,
      addTagsToItemDto.tag_ids,
      user.id,
    );
  }

  /**
   * Remove tag from item
   */
  @Delete('items/:itemId/tags/:tagId')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove tag from item' })
  @ApiParam({ name: 'itemId', description: 'Gallery item ID' })
  @ApiParam({ name: 'tagId', description: 'Tag ID' })
  @ApiResponse({ status: 204, description: 'Tag removed' })
  async removeTagFromItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ): Promise<void> {
    return this.galleryTagsService.removeTagFromItem(itemId, tagId);
  }

  /**
   * Get tags for an item
   */
  @Get('items/:itemId/tags')
  @ApiOperation({ summary: 'Get tags for an item' })
  @ApiParam({ name: 'itemId', description: 'Gallery item ID' })
  @ApiResponse({ status: 200, description: 'Item tags', type: [GalleryTag] })
  async getItemTags(
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<GalleryTag[]> {
    return this.galleryTagsService.getItemTags(itemId);
  }
}
