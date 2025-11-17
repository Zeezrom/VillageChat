// Simple script to add a token to the database
// Usage: node scripts/add-token.js <token-address> [isActive]

const fetch = require('node-fetch');

const tokenAddress = process.argv[2];
const isActive = process.argv[3] !== undefined ? parseInt(process.argv[3]) : 1;

if (!tokenAddress) {
  console.error('Usage: node scripts/add-token.js <token-address> [isActive]');
  console.error('Example: node scripts/add-token.js 0x5FbDB2315678afecb367f032d93F642f64180aa3 1');
  process.exit(1);
}

async function addToken() {
  try {
    const response = await fetch('http://localhost:3030/api/user-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenAddress,
        isActive: isActive
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add token: ${response.status} ${error}`);
    }

    const result = await response.json();
    console.log('✅ Token added successfully:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error adding token:', error.message);
    process.exit(1);
  }
}

addToken();



