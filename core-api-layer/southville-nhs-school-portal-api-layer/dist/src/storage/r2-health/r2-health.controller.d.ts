import { R2StorageService, R2ConnectionTest } from '../r2-storage/r2-storage.service';
export declare class R2HealthController {
    private readonly r2StorageService;
    constructor(r2StorageService: R2StorageService);
    getConnectionStatus(): Promise<R2ConnectionTest>;
    runConnectionTest(): Promise<R2ConnectionTest>;
    getBucketInfo(): Promise<any>;
    getConfig(): Promise<any>;
}
