import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PPTXImageConverterService {
  private readonly logger = new Logger(PPTXImageConverterService.name);

  /**
   * Convert PPTX file to array of slide images
   * @param pptxBuffer - Buffer containing PPTX file data
   * @param moduleId - Module ID for organizing files
   * @returns Array of image buffers (one per slide)
   */
  async convertPPTXToImages(
    pptxBuffer: Buffer,
    moduleId: string,
  ): Promise<Buffer[]> {
    this.logger.log(
      `[PPTXImageConverter] PPTX preview not available yet for module ${moduleId}`,
    );

    // For now, we don't support PPTX preview
    // Just return an empty array to indicate no slides available
    // The frontend will show a download message instead
    return [];
  }

  /**
   * Get file type from filename
   */
  getFileType(fileName: string): 'pdf' | 'pptx' | 'other' {
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
   * Check if file is PPTX
   */
  isPPTXFile(fileName: string): boolean {
    return this.getFileType(fileName) === 'pptx';
  }
}
