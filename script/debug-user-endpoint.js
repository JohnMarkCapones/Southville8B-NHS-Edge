// Quick diagnostic script to test /users/me endpoint
const fetch = require('node-fetch');

// Get the access token from the student login
const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('Usage: node debug-user-endpoint.js <access-token>');
  console.error('Get the access token from browser cookies after logging in');
  process.exit(1);
}

async function testEndpoint() {
  try {
    console.log('Testing /users/me endpoint...');
    console.log('Token:', ACCESS_TOKEN.substring(0, 20) + '...');
    
    const response = await fetch('http://localhost:3004/api/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('\nResponse Body:');
    try {
      const json = JSON.parse(responseText);
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log(responseText);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEndpoint();

