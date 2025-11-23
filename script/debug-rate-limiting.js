/**
 * Debug Progressive Rate Limiting
 * 
 * This script will make multiple failed login attempts and show detailed responses
 */

const API_BASE_URL = 'http://localhost:3004/api/v1';

async function debugRateLimiting() {
  console.log('🔍 Debugging Progressive Rate Limiting\n');
  
  const testCredentials = {
    email: 'test@test.com',
    password: 'wrongpassword123'
  };

  // Make 10 failed attempts and log detailed responses
  for (let i = 1; i <= 10; i++) {
    try {
      console.log(`\n📝 Attempt ${i}:`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCredentials),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      if (response.status === 429) {
        console.log(`   🚫 RATE LIMITED! Lockout level: ${data.lockoutLevel}`);
        break;
      }
      
    } catch (error) {
      console.log(`   💥 Request failed:`, error.message);
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Test with different IP simulation
async function testWithDifferentIPs() {
  console.log('\n🌐 Testing with different IP simulation...\n');
  
  const testCredentials = {
    email: 'test@test.com',
    password: 'wrongpassword123'
  };

  // Simulate different IPs by using different User-Agent headers
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  for (let i = 0; i < userAgents.length; i++) {
    try {
      console.log(`\n📝 Attempt ${i + 1} with User-Agent ${i + 1}:`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgents[i],
        },
        body: JSON.stringify(testCredentials),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.log(`   💥 Request failed:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  console.log('🚀 Starting Rate Limiting Debug\n');
  
  // Test 1: Multiple attempts from same "IP"
  await debugRateLimiting();
  
  // Test 2: Different User-Agents (simulating different clients)
  await testWithDifferentIPs();
  
  console.log('\n🎯 Debug Summary:');
  console.log('   - Check if 429 status codes are returned');
  console.log('   - Check if lockout levels are applied');
  console.log('   - Check if IP detection is working');
}

main().catch(console.error);
