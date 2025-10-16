import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { ModuleUploadThrottleGuard } from './guards/module-upload-throttle.guard';
import {
  ModulesService,
  ModuleListResult,
  ModuleUploadResult,
} from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UploadModuleDto } from './dto/upload-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import {
  AssignModuleDto,
  UpdateModuleAssignmentDto,
} from './dto/assign-module.dto';
import { Module, ModuleWithDetails } from './entities/module.entity';

@ApiTags('Modules')
@Controller('modules')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(ModuleUploadThrottleGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Module data and file upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Module file (PDF, PowerPoint, Word, or image)',
        },
        title: {
          type: 'string',
          description: 'Title of the module',
          example: 'Introduction to Biology',
        },
        description: {
          type: 'string',
          description: 'Description of the module',
          example: 'Basic concepts of biology for beginners',
        },
        isGlobal: {
          type: 'boolean',
          description:
            'Whether this module is global (accessible to all teachers of the same subject)',
          example: true,
        },
        subjectId: {
          type: 'string',
          format: 'uuid',
          description: 'Subject ID - required if isGlobal is true',
          example: '635fe7a9-bda5-4c80-91a8-8c89cf01ef47',
        },
        sectionIds: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Section IDs - required if isGlobal is false',
          example: ['123e4567-e89b-12d3-a456-426614174000'],
        },
      },
      required: ['file', 'title'],
    },
  })
  @ApiOperation({
    summary: 'Create a new module with file upload',
    description:
      'Upload a new module file and create module record. Teachers can upload 10 modules per hour.',
  })
  @ApiResponse({
    status: 201,
    description: 'Module created successfully',
    type: Module,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - upload limit exceeded',
  })
  async create(@Req() request: any, @AuthUser() user: any): Promise<Module> {
    try {
      // Parse multipart data using Fastify
      // Collect all parts (both fields and file) properly
      const parts = request.parts();
      const fields: Record<string, any> = {};
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      // Iterate through all parts to collect fields and file
      for await (const part of parts) {
        if (part.type === 'file') {
          // This is the file part - must consume the stream IMMEDIATELY
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          fileBuffer = Buffer.concat(chunks);

          // Store file metadata
          fileData = {
            fieldname: part.fieldname,
            filename: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
          };
        } else {
          // This is a field part
          fields[part.fieldname] = part.value;
        }
      }

      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file uploaded');
      }

      // Extract form fields - handle both string and boolean values properly
      const createModuleDto: CreateModuleDto = {
        title: fields.title || '',
        description: fields.description,
        isGlobal: fields.isGlobal === 'true' || fields.isGlobal === true,
        subjectId: fields.subjectId,
        sectionIds: fields.sectionIds
          ? Array.isArray(fields.sectionIds)
            ? fields.sectionIds
            : [fields.sectionIds]
          : undefined,
      };

      // Validate required fields based on module type
      if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
        throw new BadRequestException(
          'Subject ID is required for global modules',
        );
      }
      if (
        !createModuleDto.isGlobal &&
        (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)
      ) {
        throw new BadRequestException(
          'Section IDs are required for section-specific modules',
        );
      }

      // Create a file object compatible with the service
      const file: Express.Multer.File = {
        fieldname: fileData.fieldname,
        originalname: fileData.filename,
        encoding: fileData.encoding,
        mimetype: fileData.mimetype,
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: null as any,
        destination: '',
        filename: fileData.filename,
        path: '',
      };

      return this.modulesService.createWithFile(createModuleDto, file, user.id);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create module: ${error.message}`,
      );
    }
  }

  @Post(':id/upload')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @UseGuards(ModuleUploadThrottleGuard)
  @ApiOperation({
    summary: 'Upload a module file',
    description:
      'Upload a file for an existing module. Teachers can only upload to their own modules.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Module file and metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Module file (PDF, DOC, DOCX, etc.)',
        },
        title: { type: 'string', description: 'Module title' },
        description: { type: 'string', description: 'Module description' },
        isGlobal: { type: 'boolean', description: 'Whether module is global' },
        subjectId: {
          type: 'string',
          description: 'Subject ID for global modules',
        },
        sectionIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Section IDs for non-global modules',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        module: { $ref: '#/components/schemas/Module' },
        uploadResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            key: { type: 'string' },
            publicUrl: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - upload limit exceeded',
  })
  async uploadModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
    @AuthUser() user: any,
  ): Promise<ModuleUploadResult> {
    try {
      // Parse multipart data using Fastify
      // Collect all parts (both fields and file) properly
      const parts = request.parts();
      const fields: Record<string, any> = {};
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      // Iterate through all parts to collect fields and file
      for await (const part of parts) {
        if (part.type === 'file') {
          // This is the file part - must consume the stream IMMEDIATELY
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          fileBuffer = Buffer.concat(chunks);

          // Store file metadata
          fileData = {
            fieldname: part.fieldname,
            filename: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
          };
        } else {
          // This is a field part
          fields[part.fieldname] = part.value;
        }
      }

      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file uploaded');
      }

      // Extract form fields - handle both string and boolean values properly
      const uploadModuleDto: UploadModuleDto = {
        title: fields.title || '',
        description: fields.description,
        isGlobal: fields.isGlobal === 'true' || fields.isGlobal === true,
        subjectId: fields.subjectId,
        sectionIds: fields.sectionIds
          ? Array.isArray(fields.sectionIds)
            ? fields.sectionIds
            : [fields.sectionIds]
          : undefined,
      };

      // Create a file object compatible with the service
      const file: Express.Multer.File = {
        fieldname: fileData.fieldname,
        originalname: fileData.filename,
        encoding: fileData.encoding,
        mimetype: fileData.mimetype,
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: null as any,
        destination: '',
        filename: fileData.filename,
        path: '',
      };

      return this.modulesService.uploadModule(
        id,
        file,
        uploadModuleDto,
        user.id,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload module: ${error.message}`,
      );
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get accessible modules',
    description:
      'Get modules accessible to the current user based on their role and permissions.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: String,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    type: String,
    description: 'Filter by section ID',
  })
  @ApiQuery({
    name: 'isGlobal',
    required: false,
    type: Boolean,
    description: 'Filter by global modules',
  })
  @ApiQuery({
    name: 'uploadedBy',
    required: false,
    type: String,
    description: 'Filter by uploader ID',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted modules',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Modules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        modules: {
          type: 'array',
          items: { $ref: '#/components/schemas/ModuleWithDetails' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll(
    @Query() query: ModuleQueryDto,
    @AuthUser() user: any,
  ): Promise<ModuleListResult> {
    return this.modulesService.findAccessibleModules(user.id, query);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all modules (Admin only)',
    description: 'Get all modules with full access for administrators.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: String,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    type: String,
    description: 'Filter by section ID',
  })
  @ApiQuery({
    name: 'isGlobal',
    required: false,
    type: Boolean,
    description: 'Filter by global modules',
  })
  @ApiQuery({
    name: 'uploadedBy',
    required: false,
    type: String,
    description: 'Filter by uploader ID',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted modules',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'All modules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        modules: {
          type: 'array',
          items: { $ref: '#/components/schemas/ModuleWithDetails' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAllAdmin(
    @Query() query: ModuleQueryDto,
    @AuthUser() user: any,
  ): Promise<ModuleListResult> {
    return this.modulesService.findAll(query, user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get a module by ID',
    description:
      'Get a specific module by its ID. Access is controlled by user permissions.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Module retrieved successfully',
    type: ModuleWithDetails,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<ModuleWithDetails> {
    const module = await this.modulesService.findOne(id);
    if (!module) {
      throw new NotFoundException('Module not found');
    }
    return module;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update a module',
    description:
      'Update module information. Teachers can only update their own modules.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Module updated successfully',
    type: Module,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @AuthUser() user: any,
  ): Promise<Module> {
    return this.modulesService.update(id, updateModuleDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a module',
    description:
      'Soft delete a module. Teachers can only delete their own modules.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({ status: 204, description: 'Module deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.modulesService.remove(id, user.id);
  }

  @Post(':id/download')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Generate download URL for a module',
    description:
      'Generate a presigned URL for downloading a module file. Access is controlled by user permissions.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string', description: 'Presigned download URL' },
        expiresAt: { type: 'string', description: 'URL expiration timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  @ApiResponse({ status: 400, description: 'Module file not found' })
  async generateDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    return this.modulesService.generateDownloadUrl(id, user.id);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Assign module to sections',
    description:
      'Assign a module to specific sections. Teachers can only assign their own modules.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiResponse({
    status: 200,
    description: 'Module assigned to sections successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  async assignModule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignModuleDto: AssignModuleDto,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.modulesService.assignModuleToSections(
      id,
      assignModuleDto.sectionIds,
      user.id,
    );
  }

  @Put(':id/sections/:sectionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Update module assignment visibility',
    description:
      'Update the visibility of a module assignment to a specific section.',
  })
  @ApiParam({ name: 'id', description: 'Module ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Module assignment updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Module or section not found' })
  async updateModuleAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() updateDto: UpdateModuleAssignmentDto,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.modulesService.updateModuleAssignment(
      id,
      sectionId,
      updateDto,
      user.id,
    );
  }
}
