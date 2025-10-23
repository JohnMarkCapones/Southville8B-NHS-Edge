import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface R2ConnectionTest {
  isConnected: boolean;
  bucketExists: boolean;
  canUpload: boolean;
  canDownload: boolean;
  canDelete: boolean;
  bucketName: string;
  endpoint: string;
  errors: string[];
  testResults: {
    configuration: boolean;
    bucketAccess: boolean;
    uploadTest: boolean;
    downloadTest: boolean;
    deleteTest: boolean;
  };
}

export interface FileUploadResult {
  success: boolean;
  key: string;
  publicUrl?: string;
  error?: string;
}

export interface FileInfo {
  exists: boolean;
  size?: number;
  lastModified?: string;
  mimeType?: string;
}

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  public readonly config: any;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get('r2');

    this.s3Client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Test R2 connection and permissions
   */
  async testConnection(): Promise<R2ConnectionTest> {
    const errors: string[] = [];
    const testResults = {
      configuration: false,
      bucketAccess: false,
      uploadTest: false,
      downloadTest: false,
      deleteTest: false,
    };

    try {
      // Test configuration
      if (
        this.config.accountId &&
        this.config.accessKeyId &&
        this.config.secretAccessKey &&
        this.config.bucketName
      ) {
        testResults.configuration = true;
      } else {
        errors.push('Missing required R2 configuration');
      }

      // Test bucket access
      try {
        await this.s3Client.send(
          new ListObjectsV2Command({
            Bucket: this.config.bucketName,
            MaxKeys: 1,
          }),
        );
        testResults.bucketAccess = true;
      } catch (error) {
        errors.push(`Bucket access failed: ${error.message}`);
      }

      // Test upload
      try {
        const testKey = `test/connection-test-${Date.now()}.txt`;
        const testContent = 'R2 connection test';

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
          }),
        );
        testResults.uploadTest = true;
      } catch (error) {
        errors.push(`Upload test failed: ${error.message}`);
      }

      // Test download
      try {
        const testKey = `test/connection-test-${Date.now()}.txt`;
        await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.config.bucketName,
            Key: testKey,
          }),
        );
        testResults.downloadTest = true;
      } catch (error) {
        errors.push(`Download test failed: ${error.message}`);
      }

      // Test delete
      try {
        const testKey = `test/connection-test-${Date.now()}.txt`;
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.config.bucketName,
            Key: testKey,
          }),
        );
        testResults.deleteTest = true;
      } catch (error) {
        errors.push(`Delete test failed: ${error.message}`);
      }

      const isConnected = testResults.configuration && testResults.bucketAccess;
      const bucketExists = testResults.bucketAccess;

      return {
        isConnected,
        bucketExists,
        canUpload: testResults.uploadTest,
        canDownload: testResults.downloadTest,
        canDelete: testResults.deleteTest,
        bucketName: this.config.bucketName,
        endpoint: this.config.endpoint,
        errors,
        testResults,
      };
    } catch (error) {
      this.logger.error('R2 connection test failed:', error);
      errors.push(`Connection test failed: ${error.message}`);

      return {
        isConnected: false,
        bucketExists: false,
        canUpload: false,
        canDownload: false,
        canDelete: false,
        bucketName: this.config.bucketName || '',
        endpoint: this.config.endpoint || '',
        errors,
        testResults,
      };
    }
  }

  /**
   * Upload a file to R2
   */
  async uploadFile(
    key: string,
    body: Buffer | string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<FileUploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: this.config.cacheControl,
      });

      await this.s3Client.send(command);

      const publicUrl = this.config.publicUrl
        ? `${this.config.publicUrl}/${key}`
        : undefined;

      return {
        success: true,
        key,
        publicUrl,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to R2:', error);
      return {
        success: false,
        key,
        error: error.message,
      };
    }
  }

  /**
   * Generate presigned URL for file operations
   */
  async generatePresignedUrl(
    key: string,
    operation: 'getObject' | 'putObject' = 'getObject',
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command =
        operation === 'getObject'
          ? new GetObjectCommand({ Bucket: this.config.bucketName, Key: key })
          : new PutObjectCommand({ Bucket: this.config.bucketName, Key: key });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error('Failed to generate presigned URL:', error);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Delete a file from R2
   */
  async deleteFile(key: string): Promise<FileUploadResult> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        key,
      };
    } catch (error) {
      this.logger.error('Failed to delete file from R2:', error);
      return {
        success: false,
        key,
        error: error.message,
      };
    }
  }

  /**
   * List files in R2 bucket
   */
  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map((obj) => obj.Key || '') || [];
    } catch (error) {
      this.logger.error('Failed to list files from R2:', error);
      return [];
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        exists: true,
        size: response.ContentLength,
        lastModified: response.LastModified?.toISOString(),
        mimeType: response.ContentType,
      };
    } catch (error) {
      if (error.name === 'NotFound') {
        return { exists: false };
      }

      this.logger.error('Failed to get file info from R2:', error);
      return { exists: false };
    }
  }

  /**
   * Get bucket information
   */
  async getBucketInfo(): Promise<{
    bucketName: string;
    endpoint: string;
    region: string;
    objectCount: number;
    sampleObjects: Array<{
      key: string;
      size: number;
      lastModified: string;
    }>;
  }> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        MaxKeys: 10,
      });

      const response = await this.s3Client.send(command);

      return {
        bucketName: this.config.bucketName,
        endpoint: this.config.endpoint,
        region: this.config.region,
        objectCount: response.KeyCount || 0,
        sampleObjects: (response.Contents || []).map((obj) => ({
          key: obj.Key || '',
          size: obj.Size || 0,
          lastModified: obj.LastModified?.toISOString() || '',
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get bucket info from R2:', error);
      throw new BadRequestException('Failed to retrieve bucket information');
    }
  }
}
