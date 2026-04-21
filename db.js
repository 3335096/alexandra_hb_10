const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  init: async () => {
    const fs = require('fs');
    const schema = fs.readFileSync('./schema.sql', 'utf-8');
    await pool.query(schema);
    console.log('✅ Database initialized');
  }
};