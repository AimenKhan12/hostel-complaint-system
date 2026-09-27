-- ============================================
-- Hostel Complaint Management System - Database
-- Run this in pgAdmin4's Query Tool (or psql)
-- ============================================

-- 1. Users table (students + admin/warden)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,   -- stored as a hashed value, never plain text
    role VARCHAR(20) DEFAULT 'student' -- 'student' or 'admin'
);

-- 2. Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,       -- e.g. Electrical, Plumbing, Cleanliness
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal', -- set automatically by the AI
    status VARCHAR(20) DEFAULT 'Pending',  -- Pending / In Progress / Resolved
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create one admin account to start with (password = "admin123", already hashed below)
-- You can also just sign up normally through the app and change the role manually:
-- UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
