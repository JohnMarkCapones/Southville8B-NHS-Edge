#!/usr/bin/env node

/**
 * Performance Testing Script for Student Rankings API
 * Tests response times, throughput, and caching effectiveness
 */

const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3004/api/v1';
const TEST_ITERATIONS = 10;
const CONCURRENT_REQUESTS = 5;

// Test configurations
const tests = [
  {
    name: 'Student Rankings - All Grades',
    endpoint: '/public/students/rankings?limit=50',
    expectedMaxTime: 500, // 500ms
  },
  {
    name: 'Student Rankings - Grade 10 Only',
    endpoint: '/public/students/rankings?gradeLevel=Grade 10&limit=50',
    expectedMaxTime: 300, // 300ms
  },
  {
    name: 'Top GWA Students',
    endpoint: '/public/gwa/top?limit=10',
    expectedMaxTime: 400, // 400ms
  },
  {
    name: 'Student Rankings - Q1 2024-2025',
    endpoint: '/public/students/rankings?quarter=Q1&schoolYear=2024-2025&limit=50',
    expectedMaxTime: 350, // 350ms
  },
];

// Performance metrics
const metrics = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  averageResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  cacheHitRate: 0,
  throughput: 0,
};

/**
 * Make a single API request and measure performance
 */
async function makeRequest(endpoint) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const contentLength = JSON.stringify(data).length;
    
    return {
      success: true,
      responseTime,
      contentLength,
      dataSize: data.data?.length || 0,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      responseTime: endTime - startTime,
      error: error.message,
    };
  }
}

/**
 * Run a single test multiple times
 */
async function runTest(test, iterations = TEST_ITERATIONS) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`📡 Endpoint: ${test.endpoint}`);
  console.log(`🔄 Iterations: ${iterations}`);
  
  const results = [];
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const result = await makeRequest(test.endpoint);
    results.push(result);
    
    if (result.success) {
      process.stdout.write(`✅ `);
    } else {
      process.stdout.write(`❌ `);
    }
  }
  
  const totalTime = performance.now() - startTime;
  
  // Calculate metrics
  const successfulResults = results.filter(r => r.success);
  const responseTimes = successfulResults.map(r => r.responseTime);
  
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const successRate = (successfulResults.length / results.length) * 100;
  const throughput = (successfulResults.length / totalTime) * 1000; // requests per second
  
  // Check if test passed
  const passed = avgResponseTime <= test.expectedMaxTime && successRate >= 95;
  
  console.log(`\n📊 Results:`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Min Response Time: ${minResponseTime.toFixed(2)}ms`);
  console.log(`   Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
  console.log(`   Throughput: ${throughput.toFixed(2)} req/sec`);
  console.log(`   Expected Max Time: ${test.expectedMaxTime}ms`);
  console.log(`   Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Update global metrics
  metrics.totalTests++;
  if (passed) {
    metrics.passedTests++;
  } else {
    metrics.failedTests++;
  }
  
  metrics.averageResponseTime += avgResponseTime;
  metrics.minResponseTime = Math.min(metrics.minResponseTime, minResponseTime);
  metrics.maxResponseTime = Math.max(metrics.maxResponseTime, maxResponseTime);
  metrics.throughput += throughput;
  
  return {
    test: test.name,
    passed,
    avgResponseTime,
    minResponseTime,
    maxResponseTime,
    successRate,
    throughput,
  };
}

/**
 * Run concurrent load test
 */
async function runConcurrentTest(test, concurrentRequests = CONCURRENT_REQUESTS) {
  console.log(`\n🚀 Concurrent Load Test: ${test.name}`);
  console.log(`👥 Concurrent Requests: ${concurrentRequests}`);
  
  const startTime = performance.now();
  
  // Launch concurrent requests
  const promises = Array(concurrentRequests).fill().map(() => makeRequest(test.endpoint));
  const results = await Promise.all(promises);
  
  const totalTime = performance.now() - startTime;
  
  const successfulResults = results.filter(r => r.success);
  const responseTimes = successfulResults.map(r => r.responseTime);
  
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const successRate = (successfulResults.length / results.length) * 100;
  const throughput = (successfulResults.length / totalTime) * 1000;
  
  console.log(`📊 Concurrent Results:`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`   Throughput: ${throughput.toFixed(2)} req/sec`);
  
  return {
    concurrentRequests,
    successRate,
    avgResponseTime,
    totalTime,
    throughput,
  };
}

/**
 * Test caching effectiveness
 */
async function testCaching(test) {
  console.log(`\n💾 Cache Test: ${test.name}`);
  
  // First request (cache miss)
  const firstRequest = await makeRequest(test.endpoint);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Second request (should be cache hit)
  const secondRequest = await makeRequest(test.endpoint);
  
  const cacheImprovement = firstRequest.responseTime - secondRequest.responseTime;
  const cacheHitRate = cacheImprovement > 0 ? (cacheImprovement / firstRequest.responseTime) * 100 : 0;
  
  console.log(`📊 Cache Results:`);
  console.log(`   First Request: ${firstRequest.responseTime.toFixed(2)}ms`);
  console.log(`   Second Request: ${secondRequest.responseTime.toFixed(2)}ms`);
  console.log(`   Cache Improvement: ${cacheImprovement.toFixed(2)}ms`);
  console.log(`   Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
  
  return {
    firstRequest: firstRequest.responseTime,
    secondRequest: secondRequest.responseTime,
    cacheImprovement,
    cacheHitRate,
  };
}

/**
 * Main performance test runner
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests for Student Rankings API');
  console.log('=' .repeat(60));
  
  const startTime = performance.now();
  
  // Run individual tests
  for (const test of tests) {
    await runTest(test);
  }
  
  // Run concurrent test on the main endpoint
  await runConcurrentTest(tests[0]);
  
  // Test caching
  await testCaching(tests[0]);
  
  const totalTime = performance.now() - startTime;
  
  // Calculate final metrics
  metrics.averageResponseTime /= metrics.totalTests;
  metrics.throughput /= metrics.totalTests;
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PERFORMANCE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${metrics.totalTests}`);
  console.log(`Passed: ${metrics.passedTests} ✅`);
  console.log(`Failed: ${metrics.failedTests} ❌`);
  console.log(`Success Rate: ${((metrics.passedTests / metrics.totalTests) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`Min Response Time: ${metrics.minResponseTime.toFixed(2)}ms`);
  console.log(`Max Response Time: ${metrics.maxResponseTime.toFixed(2)}ms`);
  console.log(`Average Throughput: ${metrics.throughput.toFixed(2)} req/sec`);
  console.log(`Total Test Time: ${(totalTime / 1000).toFixed(2)}s`);
  
  // Performance recommendations
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  if (metrics.averageResponseTime > 500) {
    console.log('   ⚠️  Average response time is high. Consider adding more caching.');
  }
  if (metrics.throughput < 10) {
    console.log('   ⚠️  Throughput is low. Consider database optimization.');
  }
  if (metrics.passedTests === metrics.totalTests) {
    console.log('   ✅ All tests passed! Performance is excellent.');
  }
  
  console.log('\n🎉 Performance testing completed!');
}

// Run the tests
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = {
  runPerformanceTests,
  runTest,
  runConcurrentTest,
  testCaching,
};
