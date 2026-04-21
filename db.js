const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  init: async () => {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    await pool.query('ALTER TABLE gifts ADD COLUMN IF NOT EXISTS admin_note TEXT');

    const seedPath = path.join(__dirname, 'seed_gifts.sql');
    if (fs.existsSync(seedPath)) {
      let seed = fs.readFileSync(seedPath, 'utf-8');
      seed = seed.replace(/^\s*--[^\n]*$/gm, '').trim();
      const statements = seed
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await pool.query(`${stmt};`);
      }
      console.log('✅ Wishlist seed applied');

      await pool.query(`
        DELETE FROM gifts
        WHERE link IN ('https://example.com/wishlist-test-reserve', 'https://example.com/wishlist-test-group')
           OR title LIKE '[[]Тест]%'
      `);
      console.log('✅ Test gifts removed if present');
    }

    console.log('✅ Database initialized');
  }
};