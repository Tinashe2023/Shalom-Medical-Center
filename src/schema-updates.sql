-- Enhanced Appointment System - Database Schema Updates
-- Run this file with: psql -U postgres -d hospital -f schema-updates.sql

-- Add queue management fields to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS queue_position INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Add treatment/diagnosis fields to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS prescription TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Update CHECK constraint to include new status values
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
  CHECK (status IN ('scheduled', 'pending', 'queued', 'completed', 'cancelled'));

-- Create index for queue management queries
CREATE INDEX IF NOT EXISTS idx_appointments_queue 
  ON appointments(doctor_id, appointment_date, status, queue_position) 
  WHERE status = 'queued';

-- Create index for load checking queries
CREATE INDEX IF NOT EXISTS idx_appointments_load 
  ON appointments(doctor_id, appointment_date, status) 
  WHERE status IN ('scheduled', 'pending');

-- Create specialization categories table for better organization
CREATE TABLE IF NOT EXISTS specialization_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  common_symptoms TEXT[],
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on specialization name
CREATE INDEX IF NOT EXISTS idx_specialization_name ON specialization_categories(name);

-- Seed common specializations
INSERT INTO specialization_categories (name, description, common_symptoms, icon) VALUES
  ('Cardiology', 'Heart and cardiovascular system', ARRAY['chest pain', 'heart palpitations', 'high blood pressure', 'irregular heartbeat'], 'heart'),
  ('Pediatrics', 'Children''s health and development', ARRAY['fever', 'vaccination', 'growth concerns', 'child illness'], 'baby'),
  ('Dermatology', 'Skin, hair, and nail conditions', ARRAY['rash', 'acne', 'skin irritation', 'eczema', 'psoriasis'], 'droplet'),
  ('Orthopedics', 'Bones, joints, and muscles', ARRAY['joint pain', 'fracture', 'back pain', 'arthritis', 'sports injury'], 'bone'),
  ('Neurology', 'Brain and nervous system', ARRAY['headache', 'dizziness', 'seizures', 'memory problems', 'numbness'], 'brain'),
  ('General Medicine', 'General health and wellness', ARRAY['fever', 'cold', 'flu', 'fatigue', 'general checkup'], 'stethoscope')
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced appointment system schema updates completed successfully!';
    RAISE NOTICE 'New appointment statuses: scheduled, pending, queued, completed, cancelled';
    RAISE NOTICE 'Queue management fields added: queue_position, auto_assigned, assigned_at';
    RAISE NOTICE 'Specialization categories table created and seeded';
END $$;
