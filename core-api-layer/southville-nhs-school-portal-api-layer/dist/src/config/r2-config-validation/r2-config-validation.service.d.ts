import { ConfigService } from '@nestjs/config';
export declare class R2ConfigValidationService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validateR2Config(): void;
    getR2Config(): {
        accountId: string | undefined;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        bucketName: string | undefined;
        region: string | undefined;
        endpoint: string | undefined;
        publicUrl: string | undefined;
        maxFileSize: number | undefined;
        allowedMimeTypes: string[] | undefined;
        presignedUrlExpiration: number | undefined;
        cacheControl: string | undefined;
        enableCdn: boolean | undefined;
    };
    isR2Configured(): boolean;
}
