export declare class RoleCacheService {
    private cache;
    private readonly TTL;
    getCachedRole(userId: string): string | null;
    setCachedRole(userId: string, role: string): void;
    removeCachedRole(userId: string): void;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        entries: Array<{
            userId: string;
            role: string;
            age: number;
        }>;
    };
}
