// Test script to verify public endpoints are working
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3004/api/v1';

async function testPublicEndpoints() {
  console.log('🧪 Testing Public Student Rankings Endpoints...\n');

  const tests = [
    {
      name: 'Get Student Rankings',
      url: `${BASE_URL}/public/students/rankings?limit=5`,
    },
    {
      name: 'Get Top GWA Students',
      url: `${BASE_URL}/public/gwa/top?limit=5`,
    },
    {
      name: 'Get Rankings by Grade',
      url: `${BASE_URL}/public/students/rankings?gradeLevel=Grade 10&limit=3`,
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the tests
testPublicEndpoints().catch(console.error);
