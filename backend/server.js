const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500',
'https://frontend-chi-jet-bp57uucwa2.vercel.app/&#39'],  credentials: true,
}));
app.use(express.json());

app.use(session({
  store: new pgSession({
    pool: pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'hostel-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;