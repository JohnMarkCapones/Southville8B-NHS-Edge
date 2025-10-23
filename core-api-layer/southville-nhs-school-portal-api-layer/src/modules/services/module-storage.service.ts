import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { ModuleAccessService } from './module-access.service';
import * as crypto from 'crypto';
import * as path from 'path';

export interface ModuleFileUpload {
  moduleId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  filePath: string;
  publicUrl?: string;
}

export interface ModuleFileDownload {
  moduleId: string;
  fileName: string;
  filePath: string;
  downloadUrl: string;
  expiresAt: string;
}

@Injectable()
export class ModuleStorageService {
  private readonly logger = new Logger(ModuleStorageService.name);

  constructor(
    private readonly r2StorageService: R2StorageService,
    private readonly moduleAccessService: ModuleAccessService,
  ) {}

  /**
   * Upload a file for a module
   */
  async uploadModuleFile(
    moduleId: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
    uploadedBy: string,
  ): Promise<ModuleFileUpload> {
    try {
      // Validate file type
      if (!this.isValidFileType(mimeType)) {
        throw new BadRequestException(`File type ${mimeType} is not allowed`);
      }

      // Generate file path
      const filePath = `modules/${moduleId}/${fileName}`;

      // Upload to R2
      const uploadResult = await this.r2StorageService.uploadFile(
        filePath,
        fileBuffer,
        mimeType,
      );

      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload file to storage');
      }

      return {
        moduleId,
        fileName,
        fileSize: fileBuffer.length,
        mimeType,
        uploadedBy,
        filePath,
        publicUrl: uploadResult.publicUrl,
      };
    } catch (error) {
      this.logger.error('Error uploading module file:', error);
      throw error;
    }
  }

  /**
   * Generate download URL for a module file
   */
  async generateDownloadUrl(
    moduleId: string,
    fileName: string,
    userId: string,
  ): Promise<ModuleFileDownload> {
    try {
      // Check if user can access this module
      const accessResult =
        await this.moduleAccessService.canStudentAccessModule(userId, moduleId);

      if (!accessResult.canAccess) {
        throw new BadRequestException(
          accessResult.reason || 'Access denied to this module',
        );
      }

      const filePath = `modules/${moduleId}/${fileName}`;
      const downloadUrl = await this.r2StorageService.generatePresignedUrl(
        filePath,
        'getObject',
      );

      return {
        moduleId,
        fileName,
        filePath,
        downloadUrl,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };
    } catch (error) {
      this.logger.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Delete a module file
   */
  async deleteModuleFile(
    moduleId: string,
    fileName: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // Check if user can delete this module file
      const isAdmin = await this.moduleAccessService.isAdmin(userId);
      if (!isAdmin) {
        throw new BadRequestException('Only admins can delete module files');
      }

      const filePath = `modules/${moduleId}/${fileName}`;
      const deleteResult = await this.r2StorageService.deleteFile(filePath);

      return deleteResult.success;
    } catch (error) {
      this.logger.error('Error deleting module file:', error);
      throw error;
    }
  }

  /**
   * List files for a module
   */
  async listModuleFiles(moduleId: string): Promise<string[]> {
    try {
      const prefix = `modules/${moduleId}/`;
      const files = await this.r2StorageService.listFiles(prefix);
      return files.map((file) => file.replace(prefix, ''));
    } catch (error) {
      this.logger.error('Error listing module files:', error);
      return [];
    }
  }

  /**
   * Get file info for a module file
   */
  async getModuleFileInfo(
    moduleId: string,
    fileName: string,
  ): Promise<{
    exists: boolean;
    size?: number;
    lastModified?: string;
    mimeType?: string;
  }> {
    try {
      const filePath = `modules/${moduleId}/${fileName}`;
      const fileInfo = await this.r2StorageService.getFileInfo(filePath);

      return {
        exists: fileInfo.exists,
        size: fileInfo.size,
        lastModified: fileInfo.lastModified,
        mimeType: fileInfo.mimeType,
      };
    } catch (error) {
      this.logger.error('Error getting module file info:', error);
      return { exists: false };
    }
  }

  /**
   * Validate file type
   */
  private isValidFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
    ];

    return allowedTypes.includes(mimeType);
  }

  /**
   * Get storage usage for a module
   */
  async getModuleStorageUsage(moduleId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    files: Array<{
      fileName: string;
      size: number;
      lastModified: string;
    }>;
  }> {
    try {
      const prefix = `modules/${moduleId}/`;
      const files = await this.r2StorageService.listFiles(prefix);

      let totalSize = 0;
      const fileDetails: Array<{
        fileName: string;
        size: number;
        lastModified: string;
      }> = [];

      for (const filePath of files) {
        const fileInfo = await this.r2StorageService.getFileInfo(filePath);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
          fileDetails.push({
            fileName: filePath.replace(prefix, ''),
            size: fileInfo.size,
            lastModified: fileInfo.lastModified || '',
          });
        }
      }

      return {
        totalFiles: fileDetails.length,
        totalSize,
        files: fileDetails,
      };
    } catch (error) {
      this.logger.error('Error getting module storage usage:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        files: [],
      };
    }
  }

  /**
   * Upload a module file to R2 and return upload result
   */
  async uploadModule(
    file: Express.Multer.File,
    uploadedBy: string,
    isGlobal: boolean,
    subjectId?: string,
    sectionId?: string,
  ): Promise<{
    r2FileKey: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      // Validate file type
      if (!this.isValidFileType(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed`,
        );
      }

      // Generate R2 key
      const r2Key = this.generateR2Key(
        file.originalname,
        isGlobal,
        subjectId,
        sectionId,
      );

      // Upload to R2
      const uploadResult = await this.r2StorageService.uploadFile(
        r2Key,
        file.buffer,
        file.mimetype,
        {
          uploadedBy,
          isGlobal: isGlobal.toString(),
          subjectId: subjectId || '',
          sectionId: sectionId || '',
        },
      );

      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload file to R2');
      }

      return {
        r2FileKey: r2Key,
        fileUrl: uploadResult.publicUrl || '',
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Error uploading module:', error);
      throw error;
    }
  }

  /**
   * Generate R2 object key based on module type and metadata
   */
  private generateR2Key(
    fileName: string,
    isGlobal: boolean,
    subjectId?: string,
    sectionId?: string,
  ): string {
    const uuid = crypto.randomUUID();
    const ext = path.extname(fileName);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    if (isGlobal) {
      if (!subjectId) {
        throw new BadRequestException(
          'Subject ID is required for global modules',
        );
      }
      return `modules/global/${subjectId}/${uuid}-${sanitizedName}`;
    } else {
      if (!sectionId) {
        throw new BadRequestException(
          'Section ID is required for section-specific modules',
        );
      }
      return `modules/sections/${sectionId}/${uuid}-${sanitizedName}`;
    }
  }
}
