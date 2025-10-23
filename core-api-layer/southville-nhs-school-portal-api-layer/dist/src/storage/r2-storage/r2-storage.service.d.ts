import { ConfigService } from '@nestjs/config';
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
export declare class R2StorageService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    readonly config: any;
    constructor(configService: ConfigService);
    testConnection(): Promise<R2ConnectionTest>;
    uploadFile(key: string, body: Buffer | string, contentType: string, metadata?: Record<string, string>): Promise<FileUploadResult>;
    generatePresignedUrl(key: string, operation?: 'getObject' | 'putObject', expiresIn?: number): Promise<string>;
    getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<FileUploadResult>;
    listFiles(prefix?: string): Promise<string[]>;
    getFileInfo(key: string): Promise<FileInfo>;
    getBucketInfo(): Promise<{
        bucketName: string;
        endpoint: string;
        region: string;
        objectCount: number;
        sampleObjects: Array<{
            key: string;
            size: number;
            lastModified: string;
        }>;
    }>;
}
