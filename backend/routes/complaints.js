// routes/complaints.js
// This is the "main feature" file. Every route follows the SAME pattern:
// 1. Check who's logged in (req.session.user)
// 2. Do something with the database
// 3. Send back a response
// Once you understand ONE route here, you understand all of them.

const express = require('express');
const pool = require('../db');
const { detectPriority } = require('../ai');

const router = express.Router();

// Small helper: block the request if nobody is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Please login first' });
  }
  next();
}

// ---------- SUBMIT A NEW COMPLAINT (student) ----------
router.post('/', requireLogin, async (req, res) => {
  const { room_number, category, description } = req.body;
  const userId = req.session.user.id;

  try {
    // Step 1: Ask the AI how urgent this complaint sounds
    const priority = await detectPriority(description);

    // Step 2: Save the complaint + the AI's priority in the database
    const result = await pool.query(
      `INSERT INTO complaints (user_id, room_number, category, description, priority)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, room_number, category, description, priority]
    );

    res.json({ success: true, complaint: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Could not submit complaint' });
  }
});

// ---------- GET MY OWN COMPLAINTS (student) ----------
router.get('/mine', requireLogin, async (req, res) => {
  const userId = req.session.user.id;

  const result = await pool.query(
    'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.json({ success: true, complaints: result.rows });
});

// ---------- GET ALL COMPLAINTS (admin only) ----------
router.get('/all', requireLogin, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only' });
  }

  // Urgent complaints shown first, then newest first
  const result = await pool.query(`
    SELECT complaints.*, users.name AS student_name
    FROM complaints
    JOIN users ON complaints.user_id = users.id
    ORDER BY (priority = 'Urgent') DESC, created_at DESC
  `);

  res.json({ success: true, complaints: result.rows });
});

// ---------- UPDATE STATUS (admin only) ----------
router.put('/:id/status', requireLogin, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only' });
  }

  const { status } = req.body; // "Pending" | "In Progress" | "Resolved"
  const { id } = req.params;

  const result = await pool.query(
    'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  res.json({ success: true, complaint: result.rows[0] });
});

// ---------- DELETE MY COMPLAINT (student, only if still Pending) ----------
router.delete('/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  // WHERE user_id = $2 AND status = 'Pending' makes sure a student can only
  // delete their OWN complaint, and only before the admin has acted on it.
  const result = await pool.query(
    `DELETE FROM complaints WHERE id = $1 AND user_id = $2 AND status = 'Pending' RETURNING *`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ success: false, message: 'Cannot delete this complaint' });
  }

  res.json({ success: true });
});

module.exports = router;
