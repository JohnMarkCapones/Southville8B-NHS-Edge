declare const _default: (() => {
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
    jwtSecret: string | undefined;
    options: {
        auth: {
            persistSession: boolean;
            autoRefreshToken: boolean;
        };
    };
    pool: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
    jwtSecret: string | undefined;
    options: {
        auth: {
            persistSession: boolean;
            autoRefreshToken: boolean;
        };
    };
    pool: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
}>;
export default _default;
