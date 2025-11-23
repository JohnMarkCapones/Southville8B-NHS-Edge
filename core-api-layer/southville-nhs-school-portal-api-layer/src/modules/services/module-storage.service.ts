import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { ModuleAccessService } from './module-access.service';
import { PPTXImageConverterService } from './pptx-image-converter.service';
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
  downloadUrl?: string; // For PDFs
  slideUrls?: string[]; // For PPTX files - array of slide image URLs
  fileType: 'pdf' | 'pptx';
  expiresAt: string;
}

@Injectable()
export class ModuleStorageService {
  private readonly logger = new Logger(ModuleStorageService.name);

  constructor(
    private readonly r2StorageService: R2StorageService,
    private readonly moduleAccessService: ModuleAccessService,
    private readonly pptxImageConverterService: PPTXImageConverterService,
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
    r2FileKey: string,
    userId: string,
  ): Promise<ModuleFileDownload> {
    try {
      // Determine file type from extension
      const fileType = this.getFileType(r2FileKey);

      if (fileType === 'pptx') {
        this.logger.log(
          `[ModuleStorage] Processing PPTX file for module ${moduleId}`,
        );

        // Check if slide images already exist in database
        // TODO: Query database for slide_image_keys column
        // For now, we'll assume slide images need to be generated

        try {
          // Download original PPTX file
          const pptxBuffer = await this.downloadFileFromR2(r2FileKey);

          // Convert PPTX to slide images
          const slideImages =
            await this.pptxImageConverterService.convertPPTXToImages(
              pptxBuffer,
              moduleId,
            );

          // Upload slide images to R2
          const slideKeys = await this.uploadPPTXSlideImages(
            moduleId,
            slideImages,
          );

          // Generate presigned URLs for all slide images
          const slideUrls: string[] = [];
          for (const slideKey of slideKeys) {
            const slideUrl = await this.r2StorageService.generatePresignedUrl(
              slideKey,
              'getObject',
            );
            slideUrls.push(slideUrl);
          }

          this.logger.log(
            `[ModuleStorage] ✅ Generated ${slideUrls.length} slide URLs for PPTX`,
          );

          return {
            moduleId,
            fileName: r2FileKey.split('/').pop() || 'module.pptx',
            filePath: r2FileKey,
            slideUrls,
            fileType: 'pptx',
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          };
        } catch (conversionError) {
          this.logger.error(
            `[ModuleStorage] PPTX conversion failed, falling back to download:`,
            conversionError,
          );

          // Fallback to original PPTX download
          const downloadUrl = await this.r2StorageService.generatePresignedUrl(
            r2FileKey,
            'getObject',
          );

          return {
            moduleId,
            fileName: r2FileKey.split('/').pop() || 'module.pptx',
            filePath: r2FileKey,
            downloadUrl,
            fileType: 'pptx',
            expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          };
        }
      } else {
        // Default PDF handling
        this.logger.log(
          `[ModuleStorage] Processing PDF file for module ${moduleId}`,
        );

        const filePath = r2FileKey;
        const downloadUrl = await this.r2StorageService.generatePresignedUrl(
          filePath,
          'getObject',
        );

        return {
          moduleId,
          fileName: r2FileKey.split('/').pop() || 'module.pdf',
          filePath,
          downloadUrl,
          fileType: 'pdf',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        };
      }
    } catch (error) {
      this.logger.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Download file from R2
   * @param r2Key - R2 key of the file to download
   * @returns Buffer containing file data
   */
  private async downloadFileFromR2(r2Key: string): Promise<Buffer> {
    try {
      return await this.r2StorageService.downloadFile(r2Key);
    } catch (error) {
      this.logger.error(
        `[ModuleStorage] Failed to download file from R2:`,
        error,
      );
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Upload PPTX slide images to R2
   * @param moduleId - Module ID
   * @param imageBuffers - Array of image buffers (one per slide)
   * @returns Array of R2 keys for uploaded slide images
   */
  async uploadPPTXSlideImages(
    moduleId: string,
    imageBuffers: Buffer[],
  ): Promise<string[]> {
    this.logger.log(
      `[ModuleStorage] Uploading ${imageBuffers.length} slide images for module ${moduleId}`,
    );

    const slideKeys: string[] = [];

    for (let i = 0; i < imageBuffers.length; i++) {
      const slideKey = `modules/slides/${moduleId}/slide-${i + 1}.png`;

      try {
        await this.r2StorageService.uploadFile(
          slideKey,
          imageBuffers[i],
          'image/png',
        );

        slideKeys.push(slideKey);
        this.logger.log(
          `[ModuleStorage] Uploaded slide ${i + 1}/${imageBuffers.length} to R2`,
        );
      } catch (error) {
        this.logger.error(
          `[ModuleStorage] Failed to upload slide ${i + 1}:`,
          error,
        );
        throw new Error(`Failed to upload slide ${i + 1}: ${error.message}`);
      }
    }

    this.logger.log(
      `[ModuleStorage] ✅ Uploaded ${slideKeys.length} slide images to R2`,
    );
    return slideKeys;
  }

  /**
   * Get file type from filename
   */
  private getFileType(fileName: string): 'pdf' | 'pptx' | 'other' {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'pptx':
        return 'pptx';
      default:
        return 'other';
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
