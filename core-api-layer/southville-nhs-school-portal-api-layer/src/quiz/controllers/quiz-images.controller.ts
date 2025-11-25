import {
  Controller,
  Post,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CloudflareImagesService } from '../../common/services/cloudflare-images.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';

/**
 * Quiz Images Controller
 * Handles quiz image uploads and deletions using Cloudflare Images
 *
 * This controller provides endpoints for teachers to:
 * - Upload images for quiz questions
 * - Upload images for multiple choice answer options
 * - Delete quiz images
 *
 * All uploads are processed through Cloudflare Images for:
 * - Automatic optimization
 * - CDN delivery
 * - Multiple variants (thumbnail, card, public, original)
 * - Fast global access
 *
 * Supported formats: JPEG, PNG, GIF, WebP, AVIF
 * Max file size: 10MB
 */
@ApiTags('Quiz Images')
@Controller('quiz/images')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
@ApiBearerAuth('JWT-auth')
export class QuizImagesController {
  constructor(
    private readonly cloudflareImagesService: CloudflareImagesService,
  ) {}

  /**
   * Upload a quiz image (question or choice image)
   *
   * Accepts an image file and uploads it to Cloudflare Images.
   * Returns the image ID and URL for storing in the database.
   *
   * @param file - Image file to upload (multipart/form-data)
   * @returns Object containing image ID, URL, file size, and MIME type
   */
  @Post('upload')
  @ApiOperation({
    summary: 'Upload quiz image',
    description:
      'Upload an image for quiz questions or answer choices. Returns Cloudflare Images ID and URL to store in database.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Image file (JPEG, PNG, GIF, WebP, AVIF) - Max 10MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageId: {
          type: 'string',
          example: 'quiz-q-1f3b8bf5-b165-473c-9740-aaa4912516f8',
          description: 'Cloudflare Images ID (store in database)',
        },
        imageUrl: {
          type: 'string',
          example:
            'https://imagedelivery.net/abc123def/quiz-q-1f3b8bf5-b165/public',
          description: 'Full image URL for public variant',
        },
        cardUrl: {
          type: 'string',
          example:
            'https://imagedelivery.net/abc123def/quiz-q-1f3b8bf5-b165/card',
          description: 'Card variant URL (800x600)',
        },
        thumbnailUrl: {
          type: 'string',
          example:
            'https://imagedelivery.net/abc123def/quiz-q-1f3b8bf5-b165/thumbnail',
          description: 'Thumbnail URL (200x200)',
        },
        fileSize: {
          type: 'number',
          example: 524288,
          description: 'File size in bytes',
        },
        mimeType: {
          type: 'string',
          example: 'image/jpeg',
          description: 'MIME type of uploaded file',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file type, size, or upload error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid JWT token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must be Admin or Teacher',
  })
  async uploadImage(@Req() request: any): Promise<{
    imageId: string;
    imageUrl: string;
    cardUrl: string;
    thumbnailUrl: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      // Parse multipart data using Fastify
      const parts = request.parts();
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      // Iterate through all parts to find the file
      for await (const part of parts) {
        if (part.type === 'file') {
          // Read the file stream into a buffer
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
        }
      }

      // Validate that a file was provided
      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file provided');
      }

      // Validate file is an image
      if (!this.cloudflareImagesService.isImageFile(fileData.mimetype)) {
        throw new BadRequestException(
          `File type ${fileData.mimetype} is not supported. Supported types: JPEG, PNG, GIF, WebP, AVIF`,
        );
      }

      // Convert to Express.Multer.File format for CloudflareImagesService
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

      // Upload to Cloudflare Images
      const uploadResult = await this.cloudflareImagesService.uploadImage(
        file,
        {
          source: 'quiz',
          uploadedAt: new Date().toISOString(),
        },
      );

      // Generate all variant URLs
      const imageId = uploadResult.cf_image_id;

      return {
        imageId: imageId,
        imageUrl: uploadResult.cf_image_url, // Public variant
        cardUrl: this.cloudflareImagesService.getCardUrl(imageId), // 800x600
        thumbnailUrl: this.cloudflareImagesService.getThumbnailUrl(imageId), // 200x200
        fileSize: uploadResult.file_size_bytes,
        mimeType: uploadResult.mime_type,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to upload image: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete a quiz image from Cloudflare
   *
   * Deletes an image by its Cloudflare Images ID.
   * This should be called when:
   * - A quiz question is deleted
   * - A quiz question's image is replaced
   * - A quiz choice is deleted
   * - A quiz choice's image is replaced
   *
   * @param imageId - The Cloudflare Images ID to delete
   * @returns Success status
   */
  @Delete(':imageId')
  @ApiOperation({
    summary: 'Delete quiz image',
    description:
      'Delete an image from Cloudflare Images. Call this when removing or replacing quiz images.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
          description: 'Whether deletion was successful',
        },
        message: {
          type: 'string',
          example: 'Image deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid image ID',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid JWT token' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must be Admin or Teacher',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Image not found (returns success for idempotent delete)',
  })
  async deleteImage(
    @Param('imageId') imageId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Validate imageId parameter
    if (!imageId || imageId.trim().length === 0) {
      throw new BadRequestException('Image ID is required');
    }

    // Delete from Cloudflare
    const deleted = await this.cloudflareImagesService.deleteImage(imageId);

    if (deleted) {
      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } else {
      // If deletion failed (but not 404), return failure
      throw new BadRequestException('Failed to delete image');
    }
  }
}
