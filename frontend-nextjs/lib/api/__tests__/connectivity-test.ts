/**
 * API Connectivity Test Utility
 *
 * Run this file to test backend connectivity and endpoints.
 * Usage: node -r ts-node/register lib/api/__tests__/connectivity-test.ts
 */

import { apiClient } from '../client';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testHealthEndpoint() {
  log('\n🔍 Testing Health Endpoint...', colors.cyan);
  try {
    const response = await fetch('http://localhost:3004/api/v1/health');
    const data = await response.json();

    if (response.ok) {
      log('✅ Health endpoint working!', colors.green);
      log(`   Status: ${data.status}`, colors.green);
      log(`   Supabase: ${data.supabase}`, colors.green);
    } else {
      log('❌ Health endpoint failed', colors.red);
    }
  } catch (error: any) {
    log('❌ Cannot reach backend', colors.red);
    log(`   Error: ${error.message}`, colors.red);
    log('   Make sure backend is running on port 3004', colors.yellow);
  }
}

async function testQuizEndpoint() {
  log('\n🔍 Testing Quiz Available Endpoint (without auth)...', colors.cyan);
  try {
    const response = await fetch('http://localhost:3004/api/v1/quizzes/available?page=1&limit=5');
    const data = await response.json();

    if (response.status === 401) {
      log('✅ Quiz endpoint exists and requires auth (expected)', colors.green);
      log(`   Message: ${data.message}`, colors.green);
    } else if (response.status === 404) {
      log('❌ Quiz endpoint not found', colors.red);
      log('   QuizModule may not be registered in backend', colors.yellow);
    } else {
      log(`⚠️  Unexpected status: ${response.status}`, colors.yellow);
    }
  } catch (error: any) {
    log('❌ Quiz endpoint test failed', colors.red);
    log(`   Error: ${error.message}`, colors.red);
  }
}

async function testAuthenticatedRequest() {
  log('\n🔍 Testing Authenticated Request (requires login)...', colors.cyan);
  log('   This test requires you to be logged in', colors.yellow);

  try {
    // This will use the auth token from cookies
    const data = await apiClient.get('/quizzes/available?page=1&limit=5');
    log('✅ Authenticated request successful!', colors.green);
    log(`   Quizzes fetched: ${JSON.stringify(data).substring(0, 100)}...`, colors.green);
  } catch (error: any) {
    if (error.status === 401) {
      log('⚠️  Not authenticated (expected if not logged in)', colors.yellow);
      log('   Login to the app first, then run this test', colors.yellow);
    } else {
      log('❌ Authenticated request failed', colors.red);
      log(`   Error: ${error.message}`, colors.red);
    }
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('🚀 API CONNECTIVITY TEST', colors.cyan);
  log('='.repeat(60), colors.cyan);
  log(`Backend URL: http://localhost:3004`, colors.cyan);
  log(`Testing endpoints...`, colors.cyan);

  await testHealthEndpoint();
  await testQuizEndpoint();
  await testAuthenticatedRequest();

  log('\n' + '='.repeat(60), colors.cyan);
  log('✅ Tests Complete!', colors.green);
  log('='.repeat(60) + '\n', colors.cyan);
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    log(`\n❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

export { runTests, testHealthEndpoint, testQuizEndpoint, testAuthenticatedRequest };
