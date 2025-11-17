// Direct database script to add a token
// Usage: node scripts/add-token-direct.js <token-address> [isActive]

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const tokenAddress = process.argv[2];
const isActive = process.argv[3] !== undefined ? parseInt(process.argv[3]) : 1;

if (!tokenAddress) {
  console.error('Usage: node scripts/add-token-direct.js <token-address> [isActive]');
  console.error('Example: node scripts/add-token-direct.js 0x5FbDB2315678afecb367f032d93F642f64180aa3 1');
  process.exit(1);
}

async function addToken() {
  try {
    const db = await open({
      filename: path.join(__dirname, '..', 'data', 'villagechat.db'),
      driver: sqlite3.Database
    });

    // Check if token already exists
    const existing = await db.get(
      'SELECT * FROM user_tokens WHERE token = ?',
      tokenAddress
    );

    if (existing) {
      // Update existing token
      await db.run(
        'UPDATE user_tokens SET isActive = ? WHERE token = ?',
        isActive,
        tokenAddress
      );
      console.log('✅ Token updated successfully:');
      console.log(`   Address: ${tokenAddress}`);
      console.log(`   isActive: ${isActive}`);
    } else {
      // Insert new token
      const result = await db.run(
        'INSERT INTO user_tokens (token, isActive) VALUES (?, ?)',
        tokenAddress,
        isActive
      );
      console.log('✅ Token added successfully:');
      console.log(`   ID: ${result.lastID}`);
      console.log(`   Address: ${tokenAddress}`);
      console.log(`   isActive: ${isActive}`);
    }

    // Show all active tokens
    const allTokens = await db.all(
      'SELECT * FROM user_tokens WHERE isActive = 1'
    );
    console.log('\n📊 All active tokens in database:');
    allTokens.forEach(token => {
      console.log(`   - ${token.token} (ID: ${token.id})`);
    });

    await db.close();
  } catch (error) {
    console.error('❌ Error adding token:', error.message);
    if (error.message.includes('no such table')) {
      console.error('💡 Make sure the database has been initialized. Run the server once to create the tables.');
    }
    process.exit(1);
  }
}

addToken();



