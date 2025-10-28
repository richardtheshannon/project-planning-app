// Script to generate Gmail API refresh token
// Run with: node scripts/generate-gmail-token.js
// Requires: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables

require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

// Check for required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback' // Local redirect
);

// Generate auth URL
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh token
});

console.log('\n=================================================');
console.log('Gmail API Token Generator');
console.log('=================================================\n');
console.log('Step 1: Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n');
console.log('Step 2: After authorizing, you will be redirected to a URL that looks like:');
console.log('http://localhost:3000/oauth2callback?code=XXXXX...');
console.log('\n');
console.log('Step 3: Copy the entire URL and paste it here:\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the redirect URL here: ', async (redirectUrl) => {
  try {
    // Extract code from URL
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');

    if (!code) {
      console.error('\nError: No authorization code found in URL');
      rl.close();
      return;
    }

    console.log('\nExchanging authorization code for tokens...\n');

    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log('=================================================');
    console.log('SUCCESS! Here are your tokens:');
    console.log('=================================================\n');
    console.log('Add this to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log('\n');
    console.log('Full token details:');
    console.log(JSON.stringify(tokens, null, 2));
    console.log('\n=================================================');

  } catch (error) {
    console.error('\nError getting tokens:', error.message);
  } finally {
    rl.close();
  }
});
