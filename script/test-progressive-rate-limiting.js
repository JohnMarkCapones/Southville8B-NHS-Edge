/**
 * Test Progressive Rate Limiting
 * 
 * This script tests the progressive rate limiting system:
 * - 5 failed attempts → 1 minute lockout
 * - 8 total attempts → 5 minutes lockout  
 * - 10 total attempts → 15 minutes lockout
 */

const API_BASE_URL = 'http://localhost:3004/api/v1';

async function testProgressiveRateLimiting() {
  console.log('🧪 Testing Progressive Rate Limiting System\n');
  
  const testCredentials = {
    email: 'test@example.com',
    password: 'wrongpassword'
  };

  let attemptCount = 0;
  let lockoutLevel = 0;

  // Test 15 failed attempts to see progressive lockouts
  for (let i = 1; i <= 15; i++) {
    attemptCount++;
    
    try {
      console.log(`\n📝 Attempt ${i}: Testing failed login...`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
      });

      const data = await response.json();
      
      if (response.status === 429) {
        // Rate limited!
        const newLockoutLevel = data.lockoutLevel || 0;
        const retryAfter = data.retryAfter || 0;
        const totalAttempts = data.totalAttempts || 0;
        
        if (newLockoutLevel > lockoutLevel) {
          lockoutLevel = newLockoutLevel;
          console.log(`🚫 LOCKOUT LEVEL ${lockoutLevel} TRIGGERED!`);
          
          switch (lockoutLevel) {
            case 1:
              console.log(`   ⏰ 1-minute lockout for ${totalAttempts} attempts`);
              console.log(`   🔒 Retry after: ${retryAfter} seconds`);
              break;
            case 2:
              console.log(`   ⏰ 5-minute lockout for ${totalAttempts} attempts`);
              console.log(`   🔒 Retry after: ${retryAfter} seconds`);
              break;
            case 3:
              console.log(`   ⏰ 15-minute lockout for ${totalAttempts} attempts`);
              console.log(`   🔒 Retry after: ${retryAfter} seconds`);
              break;
          }
        } else {
          console.log(`   🔒 Still locked out (Level ${lockoutLevel})`);
          console.log(`   ⏰ Retry after: ${retryAfter} seconds`);
        }
        
        // If we're locked out, wait a bit before continuing
        if (retryAfter > 0 && retryAfter < 60) {
          console.log(`   ⏳ Waiting ${retryAfter} seconds before next test...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        }
      } else if (response.status === 401) {
        console.log(`   ❌ Login failed (401) - ${data.message || 'Invalid credentials'}`);
      } else {
        console.log(`   ⚠️  Unexpected response: ${response.status}`);
        console.log(`   📄 Response:`, data);
      }
      
    } catch (error) {
      console.log(`   💥 Request failed:`, error.message);
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Progressive Rate Limiting Test Complete!');
  console.log(`📊 Total attempts made: ${attemptCount}`);
  console.log(`🔒 Maximum lockout level reached: ${lockoutLevel}`);
}

// Test successful login to clear any existing lockouts
async function testSuccessfulLogin() {
  console.log('\n🧹 Testing successful login to clear lockouts...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@southville8b.edu.ph',
        password: 'admin123'
      }),
    });

    if (response.ok) {
      console.log('✅ Successful login - any lockouts should be cleared');
    } else {
      console.log('❌ Successful login failed - this is expected if credentials are wrong');
    }
  } catch (error) {
    console.log('💥 Successful login request failed:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Progressive Rate Limiting Tests\n');
  
  // First, try to clear any existing lockouts
  await testSuccessfulLogin();
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test progressive rate limiting
  await testProgressiveRateLimiting();
  
  console.log('\n🎯 Test Summary:');
  console.log('   - Progressive rate limiting should show escalating lockouts');
  console.log('   - 5 attempts → 1 minute lockout');
  console.log('   - 8 attempts → 5 minute lockout');
  console.log('   - 10 attempts → 15 minute lockout');
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/`);
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('   Make sure to run: npm run start:dev');
    return false;
  }
  return false;
}

// Main execution
async function main() {
  const isBackendRunning = await checkBackend();
  
  if (!isBackendRunning) {
    console.log('\n🛑 Please start the backend first:');
    console.log('   cd core-api-layer/southville-nhs-school-portal-api-layer');
    console.log('   npm run start:dev');
    return;
  }
  
  await runTests();
}

main().catch(console.error);
