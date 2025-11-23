import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class R2ConfigValidationService {
  private readonly logger = new Logger(R2ConfigValidationService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Validates R2 configuration on application startup
   */
  validateR2Config(): void {
    this.logger.log('Validating R2 configuration...');

    const requiredEnvVars = [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
    ];

    const missingVars: string[] = [];

    for (const envVar of requiredEnvVars) {
      const value = this.configService.get<string>(
        `r2.${envVar.toLowerCase()}`,
      );
      if (!value) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      const errorMessage = `Missing required R2 environment variables: ${missingVars.join(', ')}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Validate account ID format (should be 32 characters)
    const accountId = this.configService.get<string>('r2.accountId');
    if (accountId && accountId.length !== 32) {
      this.logger.warn(
        `R2_ACCOUNT_ID should be 32 characters long, got ${accountId.length}`,
      );
    }

    // Validate bucket name format
    const bucketName = this.configService.get<string>('r2.bucketName');
    if (bucketName) {
      if (bucketName.length < 3 || bucketName.length > 63) {
        throw new Error('R2_BUCKET_NAME must be between 3 and 63 characters');
      }
      if (!/^[a-z0-9.-]+$/.test(bucketName)) {
        throw new Error(
          'R2_BUCKET_NAME can only contain lowercase letters, numbers, dots, and hyphens',
        );
      }
    }

    // Validate file size limits
    const maxFileSize = this.configService.get<number>('r2.maxFileSize');
    if (maxFileSize && maxFileSize > 5 * 1024 * 1024 * 1024) {
      // 5GB limit
      this.logger.warn(
        'R2_MAX_FILE_SIZE exceeds 5GB, this may cause performance issues',
      );
    }

    // Validate allowed MIME types
    const allowedMimeTypes = this.configService.get<string[]>(
      'r2.allowedMimeTypes',
    );
    if (allowedMimeTypes && allowedMimeTypes.length === 0) {
      this.logger.warn(
        'No allowed MIME types configured, this may be a security risk',
      );
    }

    this.logger.log('R2 configuration validation completed successfully');
  }

  /**
   * Gets validated R2 configuration
   */
  getR2Config() {
    return {
      accountId: this.configService.get<string>('r2.accountId'),
      accessKeyId: this.configService.get<string>('r2.accessKeyId'),
      secretAccessKey: this.configService.get<string>('r2.secretAccessKey'),
      bucketName: this.configService.get<string>('r2.bucketName'),
      region: this.configService.get<string>('r2.region'),
      endpoint: this.configService.get<string>('r2.endpoint'),
      publicUrl: this.configService.get<string>('r2.publicUrl'),
      maxFileSize: this.configService.get<number>('r2.maxFileSize'),
      allowedMimeTypes: this.configService.get<string[]>('r2.allowedMimeTypes'),
      presignedUrlExpiration: this.configService.get<number>(
        'r2.presignedUrlExpiration',
      ),
      cacheControl: this.configService.get<string>('r2.cacheControl'),
      enableCdn: this.configService.get<boolean>('r2.enableCdn'),
    };
  }

  /**
   * Checks if R2 is properly configured
   */
  isR2Configured(): boolean {
    try {
      this.validateR2Config();
      return true;
    } catch (error) {
      return false;
    }
  }
}
