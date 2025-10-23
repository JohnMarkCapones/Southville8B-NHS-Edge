#!/usr/bin/env ts-node
declare class R2ConnectionTester {
    private s3Client;
    private bucketName;
    private results;
    constructor();
    runTest(testName: string, testFn: () => Promise<void>): Promise<void>;
    testConfiguration(): Promise<void>;
    testBucketAccess(): Promise<void>;
    testFileOperations(): Promise<void>;
    runAllTests(): Promise<void>;
}
export { R2ConnectionTester };
