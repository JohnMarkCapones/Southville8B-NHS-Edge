#!/usr/bin/env node

/**
 * R2 Connection Test Script
 * 
 * This script tests R2 connectivity without starting the full NestJS application.
 * Run this script to verify your R2 configuration before starting the server.
 * 
 * Usage:
 *   npm run test:r2-connection
 *   node scripts/test-r2-connection.js
 */

import { S3Client, HeadBucketCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  duration?: number;
}

class R2ConnectionTester {
  private s3Client: S3Client;
  private bucketName: string;
  private results: TestResult[] = [];

  constructor() {
    // Validate required environment variables
    const requiredVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.error('Please check your .env file and ensure all R2 variables are set.');
      process.exit(1);
    }

    this.bucketName = process.env.R2_BUCKET_NAME!;
    
    // Initialize S3 client for R2
    this.s3Client = new S3Client({
      region: process.env.R2_REGION || 'auto',
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Required for R2
    });

    console.log('🔧 R2 Connection Tester Initialized');
    console.log(`📦 Bucket: ${this.bucketName}`);
    console.log(`🌐 Endpoint: ${process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`}`);
    console.log('─'.repeat(60));
  }

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ test: testName, success: true, duration });
      console.log(`✅ ${testName} - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({ test: testName, success: false, error: error.message, duration });
      console.log(`❌ ${testName} - ${duration}ms`);
      console.log(`   Error: ${error.message}`);
    }
  }

  async testConfiguration(): Promise<void> {
    // Test 1: Configuration validation
    await this.runTest('Configuration Validation', async () => {
      if (!process.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID.length !== 32) {
        throw new Error('R2_ACCOUNT_ID must be exactly 32 characters');
      }
      if (!process.env.R2_BUCKET_NAME || process.env.R2_BUCKET_NAME.length < 3) {
        throw new Error('R2_BUCKET_NAME must be at least 3 characters');
      }
    });
  }

  async testBucketAccess(): Promise<void> {
    // Test 2: Bucket access
    await this.runTest('Bucket Access', async () => {
      const command = new HeadBucketCommand({
        Bucket: this.bucketName,
      });
      await this.s3Client.send(command);
    });
  }

  async testFileOperations(): Promise<void> {
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testContent = 'R2 connection test file';

    // Test 3: File upload
    await this.runTest('File Upload', async () => {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      });
      await this.s3Client.send(command);
    });

    // Test 4: File download
    await this.runTest('File Download', async () => {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
      });
      const response = await this.s3Client.send(command);
      const content = await response.Body?.transformToString();
      if (content !== testContent) {
        throw new Error('Downloaded content does not match uploaded content');
      }
    });

    // Test 5: File deletion
    await this.runTest('File Deletion', async () => {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: testKey,
      });
      await this.s3Client.send(command);
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting R2 Connection Tests...\n');

    await this.testConfiguration();
    await this.testBucketAccess();
    await this.testFileOperations();

    // Summary
    console.log('\n' + '─'.repeat(60));
    console.log('📊 Test Summary:');
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`✅ Successful: ${successful}/${total}`);
    console.log(`❌ Failed: ${total - successful}/${total}`);
    
    if (successful === total) {
      console.log('\n🎉 All tests passed! R2 is properly configured and accessible.');
      console.log('You can now start your NestJS application.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check your R2 configuration.');
      console.log('Failed tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.test}: ${r.error}`));
    }

    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`   ${status} ${result.test}${duration}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
  }
}

// Run the tests
async function main() {
  try {
    const tester = new R2ConnectionTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

export { R2ConnectionTester };
