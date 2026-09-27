// server.js
// This is the entry point — the file you run to start the backend.
// It just sets up Express, sessions, and connects the route files.

const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // both forms Live Server might use
  credentials: true,               // allows the session cookie to be sent
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'hostel-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// Every URL starting with /api/auth goes to auth.js
app.use('/api/auth', authRoutes);
// Every URL starting with /api/complaints goes to complaints.js
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
