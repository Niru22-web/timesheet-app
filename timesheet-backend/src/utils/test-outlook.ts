import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.join(__dirname, '../../.env.production') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/email/oauth/outlook/callback';
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID || 'common';

console.log('🔍 Outlook Configuration Check:');
console.log(`- Client ID: ${MICROSOFT_CLIENT_ID}`);
console.log(`- Redirect URI: ${MICROSOFT_REDIRECT_URI}`);
console.log(`- Tenant ID: ${MICROSOFT_TENANT_ID}`);

if (MICROSOFT_CLIENT_ID === 'YOUR_PRODUCTION_CLIENT_ID' || MICROSOFT_CLIENT_ID === 'your-outlook-client-id' || !MICROSOFT_CLIENT_ID) {
  console.log('❌ ERROR: You are still using a placeholder Client ID!');
} else {
  console.log('✅ Client ID looks like a real ID.');
}

const params = new URLSearchParams({
  client_id: MICROSOFT_CLIENT_ID,
  response_type: 'code',
  redirect_uri: MICROSOFT_REDIRECT_URI,
  scope: 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read openid profile email offline_access',
  response_mode: 'query',
  prompt: 'select_account'
});

const url = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`;

console.log('\n🔗 Generated Auth URL:');
console.log(url);
console.log('\nCopy and paste this URL into your browser to test if the Microsoft login page opens without errors.');
