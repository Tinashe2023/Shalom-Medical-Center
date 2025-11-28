-- Hospital Management System Database Schema
-- Run this file with: psql -U Tinashe -d hospital_management -f schema.sql

-- Drop existing tables if they exist (use with caution!)
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Users table (stores all user types)
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Doctors table (extended information for doctors)
CREATE TABLE doctors (
    id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_specialization ON doctors(specialization);

-- Patients table (extended information for patients)
CREATE TABLE patients (
    id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    blood_group VARCHAR(10),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor availability table (weekly schedule)
CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id VARCHAR(255) REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, day_of_week)
);

CREATE INDEX idx_availability_doctor ON doctor_availability(doctor_id);

-- Time slots table
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    availability_id INTEGER REFERENCES doctor_availability(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_slots_availability ON time_slots(availability_id);

-- Appointments table
CREATE TABLE appointments (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(255) REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Prevent double booking (unique constraint)
CREATE UNIQUE INDEX idx_unique_appointment ON appointments(doctor_id, appointment_date, appointment_time) 
WHERE status != 'cancelled';

-- Medical records table
CREATE TABLE medical_records (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(255) REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id VARCHAR(255) REFERENCES appointments(id) ON DELETE SET NULL,
    record_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    notes TEXT,
    blood_pressure VARCHAR(20),
    heart_rate VARCHAR(20),
    temperature VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_records_patient ON medical_records(patient_id);
CREATE INDEX idx_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_records_date ON medical_records(record_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON doctor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user (pre-verified for immediate access)
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (id, email, password, role, name, phone, email_verified)
VALUES ('admin-1', 'admin@hospital.com', '$2a$10$YQ98zLXVVWKDN8JhNMdTCOuKmCfKg3xXU3T8qFHGqvqHqJX2a8gSy', 'admin', 'System Admin', '555-0000', true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Admin user created: admin@hospital.com / admin123';
    RAISE NOTICE 'Run "npm run seed" from backend directory to add sample data';
END $$;
