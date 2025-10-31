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
import { FolderService } from './services/folder.service';
import { FileStorageService } from './services/file-storage.service';
import { FileDownloadLoggerService } from './services/file-download-logger.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderQueryDto } from './dto/folder-query.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import {
  TeacherFolder,
  TeacherFolderWithChildren,
} from './entities/teacher-folder.entity';
import {
  TeacherFile,
  TeacherFileWithDetails,
} from './entities/teacher-file.entity';

@ApiTags('Teacher Files')
@Controller('teacher-files')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TeacherFilesController {
  constructor(
    private readonly folderService: FolderService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileDownloadLoggerService: FileDownloadLoggerService,
  ) {}

  // ==================== FOLDER ENDPOINTS ====================

  @Get('folders')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get folder tree',
    description:
      'Get hierarchical folder structure. Admins can include deleted folders.',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted folders (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder tree retrieved successfully',
    type: [TeacherFolderWithChildren],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFolderTree(
    @Query() query: FolderQueryDto,
    @Req() request: any,
  ): Promise<TeacherFolder[]> {
    // Return flat list instead of tree for frontend to build its own tree
    return this.folderService.findAll(
      query.includeDeleted,
      request.accessToken,
    );
  }

  @Get('folders/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get folder details with file count',
    description: 'Get detailed information about a specific folder',
  })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder retrieved successfully',
    type: TeacherFolderWithChildren,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async getFolder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherFolderWithChildren> {
    return this.folderService.findOneWithFileCount(id);
  }

  @Post('folders')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create new folder (Admin only)',
    description: 'Create a new folder in the file system',
  })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
    type: TeacherFolder,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @AuthUser() user: any,
  ): Promise<TeacherFolder> {
    return this.folderService.create(createFolderDto, user.id);
  }

  @Put('folders/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update folder (Admin only)',
    description: 'Update folder name, description, or move to different parent',
  })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder updated successfully',
    type: TeacherFolder,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async updateFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @AuthUser() user: any,
  ): Promise<TeacherFolder> {
    return this.folderService.update(id, updateFolderDto, user.id);
  }

  @Delete('folders/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete folder (Admin only)',
    description: 'Mark folder as deleted. Cannot delete folders with children.',
  })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 204, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 400, description: 'Folder has children' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async deleteFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.folderService.softDelete(id, user.id);
  }

  @Post('folders/:id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Restore deleted folder (Admin only)',
    description: 'Restore a soft-deleted folder',
  })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder restored successfully',
    type: TeacherFolder,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async restoreFolder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherFolder> {
    return this.folderService.restore(id);
  }

  // ==================== FILE ENDPOINTS ====================

  @Get('files')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get files with filtering and pagination',
    description: 'Get list of files with optional filters',
  })
  @ApiQuery({
    name: 'folderId',
    required: false,
    type: String,
    description: 'Filter by folder ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in title and description',
  })
  @ApiQuery({
    name: 'mimeType',
    required: false,
    type: String,
    description: 'Filter by MIME type',
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
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeacherFile' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFiles(@Query() query: FileQueryDto) {
    return this.fileStorageService.findAll(query);
  }

  @Get('files/:id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get file details',
    description: 'Get detailed information about a specific file',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
    type: TeacherFileWithDetails,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherFileWithDetails> {
    return this.fileStorageService.findOneWithDetails(id);
  }

  @Post('files')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 50MB)',
        },
        folder_id: {
          type: 'string',
          format: 'uuid',
          description: 'Folder ID',
        },
        title: {
          type: 'string',
          description: 'File title',
        },
        description: {
          type: 'string',
          description: 'File description',
        },
      },
      required: ['file', 'folder_id', 'title'],
    },
  })
  @ApiOperation({
    summary: 'Upload file (Admin only)',
    description: 'Upload a new file to a folder',
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: TeacherFile,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation or file error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async uploadFile(
    @Req() request: any,
    @AuthUser() user: any,
  ): Promise<TeacherFile> {
    try {
      // Parse multipart data using Fastify
      const parts = request.parts();
      const fields: Record<string, any> = {};
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      // Iterate through all parts
      for await (const part of parts) {
        if (part.type === 'file') {
          // File part - consume stream immediately
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          fileBuffer = Buffer.concat(chunks);

          fileData = {
            filename: part.filename,
            mimetype: part.mimetype,
          };
        } else {
          // Field part
          fields[part.fieldname] = part.value;
        }
      }

      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file uploaded');
      }

      if (!fields.folder_id) {
        throw new BadRequestException('folder_id is required');
      }

      if (!fields.title) {
        throw new BadRequestException('title is required');
      }

      return this.fileStorageService.uploadFile(
        fields.folder_id,
        fields.title,
        fileBuffer,
        fileData.filename,
        fileData.mimetype,
        user.id,
        fields.description,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  @Put('files/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update file metadata (Admin only)',
    description: 'Update file title, description, or move to different folder',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File updated successfully',
    type: TeacherFile,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async updateFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFileDto: UpdateFileDto,
    @AuthUser() user: any,
  ): Promise<TeacherFile> {
    return this.fileStorageService.update(id, updateFileDto, user.id);
  }

  @Post('files/:id/replace')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Replace file content',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New file to replace existing one',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Replace file content (Admin only)',
    description: 'Replace the actual file while keeping same metadata',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File replaced successfully',
    type: TeacherFile,
  })
  @ApiResponse({ status: 400, description: 'Bad request - file error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async replaceFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: any,
    @AuthUser() user: any,
  ): Promise<TeacherFile> {
    try {
      const parts = request.parts();
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          fileBuffer = Buffer.concat(chunks);

          fileData = {
            filename: part.filename,
            mimetype: part.mimetype,
          };
        }
      }

      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file uploaded');
      }

      return this.fileStorageService.replaceFile(
        id,
        fileBuffer,
        fileData.filename,
        fileData.mimetype,
        user.id,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to replace file: ${error.message}`);
    }
  }

  @Delete('files/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete file (Admin only)',
    description: 'Mark file as deleted and move to .deleted/ in storage',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.fileStorageService.softDelete(id, user.id);
  }

  @Post('files/:id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Restore deleted file (Admin only)',
    description: 'Restore a soft-deleted file',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File restored successfully',
    type: TeacherFile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  async restoreFile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherFile> {
    return this.fileStorageService.restore(id);
  }

  @Get('files/:id/download-url')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get presigned download URL',
    description:
      'Generate a temporary presigned URL to download the file (valid for 1 hour)',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Presigned download URL' },
        expiresAt: { type: 'string', description: 'URL expiration timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
    @Req() request: any,
  ): Promise<{ url: string; expiresAt: string }> {
    // Log the download
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || '';
    const userAgent = request.headers['user-agent'] || '';

    await this.fileDownloadLoggerService.logDownload(
      id,
      user.id,
      ipAddress,
      userAgent,
      true,
    );

    return this.fileStorageService.generateDownloadUrl(id, request.accessToken);
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  @Get('analytics/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get overall download analytics (Admin only)',
    description: 'Get system-wide download statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalDownloads: { type: 'number' },
        totalFiles: { type: 'number' },
        totalUsers: { type: 'number' },
        averageDownloadsPerFile: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getOverviewAnalytics() {
    return this.fileDownloadLoggerService.getOverallStats();
  }

  @Get('analytics/popular')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get most downloaded files (Admin only)',
    description: 'Get list of files sorted by download count',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of files to return (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Popular files retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file_id: { type: 'string' },
          download_count: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getPopularFiles(@Query('limit') limit?: number) {
    return this.fileDownloadLoggerService.getPopularFiles(limit || 10);
  }

  @Get('files/:id/downloads')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get download history for file (Admin only)',
    description: 'Get complete download log for a specific file',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Download history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        downloads: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeacherFileDownload' },
        },
        stats: {
          type: 'object',
          properties: {
            totalDownloads: { type: 'number' },
            uniqueUsers: { type: 'number' },
            successRate: { type: 'number' },
            lastDownloaded: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getFileDownloads(@Param('id', ParseUUIDPipe) id: string) {
    const [downloads, stats] = await Promise.all([
      this.fileDownloadLoggerService.getFileDownloads(id),
      this.fileDownloadLoggerService.getFileStats(id),
    ]);

    return { downloads, stats };
  }

  @Get('analytics/my-downloads')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get my download history',
    description: 'Get download history for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Download history retrieved successfully',
    type: Array,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyDownloads(@AuthUser() user: any) {
    return this.fileDownloadLoggerService.getUserDownloads(user.id);
  }
}
