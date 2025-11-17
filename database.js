const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

class Database {
  constructor() {
    this.dbPromise = null;
  }

  async init() {
    if (!this.dbPromise) {
      const dbPath = path.join(__dirname, 'data', 'villagechat.db');
      console.log('📁 Database file path:', dbPath);
      console.log('📁 Database file exists:', fs.existsSync(dbPath));
      
      this.dbPromise = open({
        filename: dbPath,
        driver: sqlite3.Database
      }).then(async (db) => {
        await db.exec('PRAGMA foreign_keys = ON');
        await this.migrate(db);
        await this.seedData(db);
        
        // Log all tokens on startup for debugging
        const allTokens = await db.all('SELECT * FROM user_tokens');
        console.log('📊 All tokens in database on startup:', allTokens.length);
        allTokens.forEach(token => {
          console.log(`   - ID: ${token.id}, Token: ${token.token}, isActive: ${token.isActive} (type: ${typeof token.isActive})`);
        });
        
        return db;
      }).catch((error) => {
        console.error('Database initialization error:', error);
        this.dbPromise = null;
        throw error;
      });
    }

    return this.dbPromise;
  }

  async migrate(db) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        cost NUMERIC DEFAULT 0,
        is_public INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id INTEGER NOT NULL,
        account TEXT NOT NULL,
        username TEXT,
        text TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account TEXT NOT NULL UNIQUE,
        username TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        isActive INTEGER NOT NULL DEFAULT 1 CHECK (isActive IN (0, 1))
      );
    `);
  }

  async seedData(db) {
    const { count } = await db.get('SELECT COUNT(1) AS count FROM channels');
    if (count > 0) {
      return;
    }

    await db.run(`
      INSERT INTO channels (name, description, cost, is_public) VALUES
        ('general', 'General discussion', 0, 1),
        ('village', 'Village coordination', 0, 1),
        ('trading', 'Trade and resources', 0, 1),
        ('announcements', 'Important announcements', 0, 1),
        ('tech', 'Technology and hacking', 0, 1)
    `);

    await db.run(`
      INSERT INTO messages (channel_id, account, username, text) VALUES
        (1, '0xcA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa', 'System', 'Welcome to VillageChat! The digital wasteland''s communication hub.'),
        (1, '0x1b3cB81E51011b549d78bf720b0d924ac763A7C2', 'Survivor_Ann', 'Anyone else hear that distant explosion? The grid''s been unstable lately.'),
        (2, '0x701C484bfb40ac628aFA487b6082f084B14AF0BD', 'Village_Guard', 'The village walls are holding strong. We''ve got power from the old solar panels.')
    `);

    // Add some test NFT contract addresses to user_tokens table
    await db.run(`
      INSERT INTO user_tokens (token, isActive) VALUES
        ('0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', 1)
    `);
  }

  async getDb() {
    return this.init();
  }

  // Channel methods
  async getChannels() {
    const db = await this.getDb();
    return db.all('SELECT id, name, description, cost, is_public AS isPublic, created_at AS createdAt FROM channels ORDER BY id ASC');
  }

  async getChannel(id) {
    const db = await this.getDb();
    return db.get('SELECT id, name, description, cost, is_public AS isPublic, created_at AS createdAt FROM channels WHERE id = ?', id);
  }

  async addChannel({ name, description, cost = 0, isPublic = true }) {
    const db = await this.getDb();
    const result = await db.run(
      'INSERT INTO channels (name, description, cost, is_public) VALUES (?, ?, ?, ?)',
      name,
      description,
      cost,
      isPublic ? 1 : 0
    );
    return this.getChannel(result.lastID);
  }

  // Message methods
  async getMessages(channelId) {
    const db = await this.getDb();
    return db.all(
      `SELECT id, channel_id AS channelId, account, username, text, timestamp
       FROM messages
       WHERE channel_id = ?
       ORDER BY timestamp ASC, id ASC`,
      channelId
    );
  }

  async addMessage({ channelId, account, text, username }) {
    const db = await this.getDb();
    const result = await db.run(
      'INSERT INTO messages (channel_id, account, username, text) VALUES (?, ?, ?, ?)',
      channelId,
      account,
      username,
      text
    );
    return db.get(
      `SELECT id, channel_id AS channelId, account, username, text, timestamp
       FROM messages
       WHERE id = ?`,
      result.lastID
    );
  }

  // User methods
  async getUser(account) {
    const db = await this.getDb();
    return db.get(
      `SELECT id, account, username, joined_at AS joinedAt
       FROM users
       WHERE LOWER(account) = LOWER(?)`,
      account
    );
  }

  async addUser({ account, username }) {
    const existingUser = await this.getUser(account);
    if (existingUser) {
      return existingUser;
    }

    const db = await this.getDb();
    const result = await db.run(
      'INSERT INTO users (account, username) VALUES (?, ?)',
      account,
      username
    );
    return db.get(
      `SELECT id, account, username, joined_at AS joinedAt
       FROM users
       WHERE id = ?`,
      result.lastID
    );
  }

  async updateUser(account, updates) {
    const db = await this.getDb();
    const existingUser = await this.getUser(account);
    if (!existingUser) {
      return null;
    }

    const newUsername = updates.username ?? existingUser.username;

    await db.run(
      'UPDATE users SET username = ? WHERE id = ?',
      newUsername,
      existingUser.id
    );

    return this.getUser(account);
  }

  async getActiveUserTokens() {
    const db = await this.getDb();
    
    // First, get ALL tokens to see what's in the database
    const allTokens = await db.all('SELECT * FROM user_tokens');
    console.log('🔍 Database query - ALL tokens in database:', allTokens.length);
    allTokens.forEach(token => {
      console.log(`   - ID: ${token.id}, Token: ${token.token}, isActive: ${token.isActive} (type: ${typeof token.isActive}, value: ${JSON.stringify(token.isActive)})`);
    });
    
    // Now get only active tokens
    const tokens = await db.all(
      `SELECT id, token, isActive
       FROM user_tokens
       WHERE isActive = 1
       ORDER BY id ASC`
    );
    console.log('🔍 Database query - Active tokens found (WHERE isActive = 1):', tokens.length);
    console.log('🔍 Database query - Active tokens:', JSON.stringify(tokens, null, 2));
    
    // Also try with different comparisons
    const tokensAsString = await db.all(
      `SELECT id, token, isActive
       FROM user_tokens
       WHERE isActive = '1'
       ORDER BY id ASC`
    );
    console.log('🔍 Database query - Active tokens (WHERE isActive = "1"):', tokensAsString.length);
    
    return tokens;
  }

  async getAllUserTokens() {
    const db = await this.getDb();
    const tokens = await db.all(
      `SELECT id, token, isActive
       FROM user_tokens
       ORDER BY id ASC`
    );
    console.log('🔍 Database query - All tokens found:', tokens.length);
    return tokens;
  }

  async addUserToken({ token, isActive = 1 }) {
    const db = await this.getDb();
    try {
      const result = await db.run(
        'INSERT OR REPLACE INTO user_tokens (token, isActive) VALUES (?, ?)',
        token,
        isActive
      );
      return db.get(
        `SELECT id, token, isActive
         FROM user_tokens
         WHERE id = ?`,
        result.lastID
      );
    } catch (error) {
      // If token already exists, update it
      await db.run(
        'UPDATE user_tokens SET isActive = ? WHERE token = ?',
        isActive,
        token
      );
      return db.get(
        `SELECT id, token, isActive
         FROM user_tokens
         WHERE token = ?`,
        token
      );
    }
  }
}

module.exports = new Database();
