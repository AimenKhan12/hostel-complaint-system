// db.js
// This file makes ONE connection pool to PostgreSQL that the rest
// of the app reuses. Think of it as "the phone line to pgAdmin4's database."

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,        // usually "localhost"
  port: process.env.DB_PORT,        // usually 5432
  user: process.env.DB_USER,        // your pgAdmin4 username, usually "postgres"
  password: process.env.DB_PASSWORD,// your pgAdmin4 password
  database: process.env.DB_NAME,    // the database name you created, e.g. "hostel_db"
});

// Quick check when the server starts, so you immediately know if the DB is connected
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Could not connect to database:', err.message);
  });

module.exports = pool;
