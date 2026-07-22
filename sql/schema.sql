-- Run with: tsx ../config/setup.ts
-- Or:       npm run db:setup

CREATE TABLE IF NOT EXISTS students(
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INT CHECK(age >= 16),
  department TEXT NOT NULL,
  level INT,
  cgpa NUMERIC(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data to test GET /students immediately
INSERT INTO students(first_name, last_name, email, age, department, level, cgpa) VALUES
  ('Andy', 'Scott', 'a.scott@mail.com', 21, 'Marketing', 400, 4.01), 
  ('Tracy', 'Goodman', 'tgoodman@yahoo.com', 18, 'International Relations', 300, 4.23)
ON CONFLICT(email) DO NOTHING
