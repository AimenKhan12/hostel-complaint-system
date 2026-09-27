// create-admin.js
// Run this ONCE to create an admin account. Nobody can become admin
// through the public signup form anymore — only whoever runs this script
// (i.e. you, the developer) can create an admin. This is how real apps do it.
//
// HOW TO RUN:
//   node create-admin.js "Warden Name" "warden@hostel.com" "somepassword"

const bcrypt = require('bcryptjs');
const pool = require('./db');

async function createAdmin() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.log('Usage: node create-admin.js "Name" "email@example.com" "password"');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'admin') RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );
    console.log('✅ Admin account created:', result.rows[0]);
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }

  process.exit(0);
}

createAdmin();
