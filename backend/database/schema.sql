-- backend/database/schema.sql (PostgreSQL version for Render)
-- This file creates all tables for the hostel management system

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id SERIAL PRIMARY KEY,
  room_number VARCHAR(32) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 2,
  occupied INT DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('Available', 'Full', 'Maintenance')) NOT NULL DEFAULT 'Available',
  price DECIMAL(10,2) DEFAULT 1500.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  gender VARCHAR(10),
  phone VARCHAR(15),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  room_id INT REFERENCES rooms(room_id) ON DELETE SET NULL,
  date_of_joining DATE,
  status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Notice Period')) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  payment_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month VARCHAR(20) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Pending', 'Paid')) DEFAULT 'Pending',
  payment_date TIMESTAMP,
  payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Online')) DEFAULT 'Online',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Pending', 'In Progress', 'Resolved')) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_room ON students(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);

-- Display success message
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully!';
END $$;