// routes/auth.js
// Handles signup and login. Uses simple sessions (NOT JWT) — much easier to explain:
// "user logs in -> server remembers them using a session -> stays logged in via a cookie"

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// ---------- SIGNUP ----------
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Never save plain password — hash it first
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'student']
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ success: false, message: 'Signup failed. Email might already exist.' });
  }
});

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ success: false, message: 'Wrong password' });
    }

    // Save user info in the session -> this is what "keeps them logged in"
    req.session.user = { id: user.id, name: user.name, role: user.role };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ---------- LOGOUT ----------
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ---------- CHECK CURRENT SESSION (used by frontend on page load) ----------
router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;
