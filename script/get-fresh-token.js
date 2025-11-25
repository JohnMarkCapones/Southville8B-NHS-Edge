/**
 * Get Fresh JWT Token from Supabase
 *
 * Usage:
 * node get-fresh-token.js
 *
 * Update the email and password below with your admin credentials
 */

const SUPABASE_URL = 'https://hafuhxmqwealmvvjfgcw.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Get from Supabase dashboard

const email = 'superadmin@gmail.com'; // Your admin email
const password = 'YOUR_PASSWORD'; // Your admin password

async function getFreshToken() {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('\n✅ Fresh JWT Token:\n');
      console.log(data.access_token);
      console.log('\n📋 Copy the token above and use it in your curl commands');
      console.log(`\n⏰ Token expires at: ${new Date(Date.now() + data.expires_in * 1000).toLocaleString()}`);
      console.log(`   (Valid for ${data.expires_in / 60} minutes)\n`);
    } else {
      console.error('❌ Error getting token:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getFreshToken();
