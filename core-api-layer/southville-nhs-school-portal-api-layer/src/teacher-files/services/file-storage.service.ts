import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { TeacherFile, TeacherFileWithDetails } from '../entities/teacher-file.entity';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FileQueryDto } from '../dto/file-query.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  // File size limit: 50MB
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  // Allowed MIME types
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-excel', // XLS
    'application/msword', // DOC
    'application/vnd.ms-powerpoint', // PPT
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/csv',
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  /**
   * Get all files with filtering and pagination
   */
  async findAll(query: FileQueryDto): Promise<{
    files: TeacherFile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { folderId, search, mimeType, page = 1, limit = 20 } = query;
      const offset = (page - 1) * limit;

      let queryBuilder = this.supabaseService
        .getClient()
        .from('teacher_files')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      // Apply filters
      if (folderId) {
        queryBuilder = queryBuilder.eq('folder_id', folderId);
      }

      if (mimeType) {
        queryBuilder = queryBuilder.eq('mime_type', mimeType);
      }

      if (search) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Apply pagination
      queryBuilder = queryBuilder
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) {
        this.logger.error('Error fetching files:', error);
        throw new InternalServerErrorException(
          'Failed to fetch files: ' + error.message,
        );
      }

      return {
        files: data as TeacherFile[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async findOne(id: string, accessToken?: string): Promise<TeacherFile> {
    try {
      const client = accessToken
        ? this.supabaseService.getClientWithAuth(accessToken)
        : this.supabaseService.getClient();

      const { data, error } = await client
        .from('teacher_files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`File with ID ${id} not found`);
        }
        this.logger.error('Error fetching file:', error);
        throw new InternalServerErrorException(
          'Failed to fetch file: ' + error.message,
        );
      }

      return data as TeacherFile;
    } catch (error) {
      this.logger.error('Error in findOne:', error);
      throw error;
    }
  }

  /**
   * Get file with details (folder, uploader)
   */
  async findOneWithDetails(id: string): Promise<TeacherFileWithDetails> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('teacher_files')
        .select(
          `
          *,
          folder:teacher_folders!inner(id, name, parent_id),
          uploader:users!uploaded_by(id, full_name, email)
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`File with ID ${id} not found`);
        }
        this.logger.error('Error fetching file with details:', error);
        throw new InternalServerErrorException(
          'Failed to fetch file: ' + error.message,
        );
      }

      return data as TeacherFileWithDetails;
    } catch (error) {
      this.logger.error('Error in findOneWithDetails:', error);
      throw error;
    }
  }

  /**
   * Upload file to R2 and create database record
   */
  async uploadFile(
    folderId: string,
    title: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId: string,
    description?: string,
  ): Promise<TeacherFile> {
    try {
      // Validate file size
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new BadRequestException(`File type ${mimeType} is not allowed`);
      }

      // Verify folder exists
      const { data: folder, error: folderError } = await this.supabaseService
        .getClient()
        .from('teacher_folders')
        .select('id')
        .eq('id', folderId)
        .eq('is_deleted', false)
        .single();

      if (folderError || !folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }

      // Generate R2 key
      const r2Key = this.generateR2Key(folderId, originalFilename);

      // Upload to R2
      const uploadResult = await this.r2StorageService.uploadFile(
        r2Key,
        fileBuffer,
        mimeType,
        {
          uploadedBy: userId,
          folderId,
          originalFilename,
        },
      );

      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload file to storage');
      }

      // Create database record
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_files')
        .insert({
          folder_id: folderId,
          title,
          description,
          file_url: uploadResult.publicUrl || '',
          r2_file_key: r2Key,
          file_size_bytes: fileBuffer.length,
          mime_type: mimeType,
          original_filename: originalFilename,
          uploaded_by: userId,
          updated_by: userId,
        })
        .select()
        .single();

      if (error) {
        // Rollback: Delete uploaded file from R2
        await this.r2StorageService.deleteFile(r2Key);
        this.logger.error('Error creating file record:', error);
        throw new InternalServerErrorException(
          'Failed to create file record: ' + error.message,
        );
      }

      return data as TeacherFile;
    } catch (error) {
      this.logger.error('Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * Update file metadata (not the actual file)
   */
  async update(
    id: string,
    updateFileDto: UpdateFileDto,
    userId: string,
  ): Promise<TeacherFile> {
    try {
      // Check file exists
      await this.findOne(id);

      // Validate new folder if being changed
      if (updateFileDto.folder_id) {
        const { data: folder, error: folderError } =
          await this.supabaseService
            .getClient()
            .from('teacher_folders')
            .select('id')
            .eq('id', updateFileDto.folder_id)
            .eq('is_deleted', false)
            .single();

        if (folderError || !folder) {
          throw new NotFoundException(
            `Folder with ID ${updateFileDto.folder_id} not found`,
          );
        }
      }

      const updateData: any = {
        updated_by: userId,
      };

      if (updateFileDto.title !== undefined) {
        updateData.title = updateFileDto.title;
      }
      if (updateFileDto.description !== undefined) {
        updateData.description = updateFileDto.description;
      }
      if (updateFileDto.folder_id !== undefined) {
        updateData.folder_id = updateFileDto.folder_id;
      }

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_files')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating file:', error);
        throw new InternalServerErrorException(
          'Failed to update file: ' + error.message,
        );
      }

      return data as TeacherFile;
    } catch (error) {
      this.logger.error('Error in update:', error);
      throw error;
    }
  }

  /**
   * Replace file content
   */
  async replaceFile(
    id: string,
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId: string,
  ): Promise<TeacherFile> {
    try {
      // Get existing file
      const existingFile = await this.findOne(id);

      // Validate file size
      if (fileBuffer.length > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }

      // Validate MIME type
      if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new BadRequestException(`File type ${mimeType} is not allowed`);
      }

      // Generate new R2 key
      const newR2Key = this.generateR2Key(
        existingFile.folder_id,
        originalFilename,
      );

      // Upload new file to R2
      const uploadResult = await this.r2StorageService.uploadFile(
        newR2Key,
        fileBuffer,
        mimeType,
        {
          uploadedBy: userId,
          folderId: existingFile.folder_id,
          originalFilename,
          replacedFile: existingFile.r2_file_key,
        },
      );

      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload replacement file');
      }

      // Delete old file from R2
      await this.r2StorageService.deleteFile(existingFile.r2_file_key);

      // Update database record
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_files')
        .update({
          file_url: uploadResult.publicUrl || '',
          r2_file_key: newR2Key,
          file_size_bytes: fileBuffer.length,
          mime_type: mimeType,
          original_filename: originalFilename,
          updated_by: userId,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Rollback: Delete new file and keep old file
        await this.r2StorageService.deleteFile(newR2Key);
        this.logger.error('Error updating file record after replacement:', error);
        throw new InternalServerErrorException(
          'Failed to update file record: ' + error.message,
        );
      }

      return data as TeacherFile;
    } catch (error) {
      this.logger.error('Error in replaceFile:', error);
      throw error;
    }
  }

  /**
   * Soft delete file (keep in R2, mark as deleted in DB)
   */
  async softDelete(id: string, userId: string): Promise<void> {
    try {
      const file = await this.findOne(id);

      // Update database record - mark as deleted but keep file in R2
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_files')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', id);

      if (error) {
        this.logger.error('Error soft deleting file:', error);
        throw new InternalServerErrorException(
          'Failed to delete file: ' + error.message,
        );
      }

      // Note: File remains in R2 storage at original location
      // Can be permanently deleted after retention period by admin
    } catch (error) {
      this.logger.error('Error in softDelete:', error);
      throw error;
    }
  }

  /**
   * Restore soft-deleted file
   */
  async restore(id: string): Promise<TeacherFile> {
    try {
      const { data: file, error: fetchError} = await this.supabaseService
        .getClient()
        .from('teacher_files')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !file) {
        throw new NotFoundException(`File with ID ${id} not found`);
      }

      if (!file.is_deleted) {
        throw new BadRequestException('File is not deleted');
      }

      // Update database record - file is still in R2 at original location
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_files')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error restoring file:', error);
        throw new InternalServerErrorException(
          'Failed to restore file: ' + error.message,
        );
      }

      return data as TeacherFile;
    } catch (error) {
      this.logger.error('Error in restore:', error);
      throw error;
    }
  }

  /**
   * Generate presigned download URL
   */
  async generateDownloadUrl(
    fileId: string,
    accessToken?: string,
  ): Promise<{ url: string; expiresAt: string }> {
    try {
      const file = await this.findOne(fileId, accessToken);

      if (file.is_deleted) {
        throw new BadRequestException('Cannot download deleted file');
      }

      const url = await this.r2StorageService.generatePresignedUrl(
        file.r2_file_key,
        'getObject',
      );

      return {
        url,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };
    } catch (error) {
      this.logger.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Generate R2 key for file
   */
  private generateR2Key(folderId: string, originalFilename: string): string {
    const uuid = crypto.randomUUID();
    const ext = path.extname(originalFilename);
    const sanitizedName = originalFilename
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();

    return `teacher-files/${folderId}/${uuid}-${sanitizedName}${ext}`;
  }

  /**
   * Validate MIME type
   */
  isValidMimeType(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(mimeType);
  }
}
