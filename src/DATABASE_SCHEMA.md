# Hospital Management System - PostgreSQL Database Schema

## Setup Instructions

1. Create the database:
```bash
psql -U Tinashe
CREATE DATABASE hospital_management;
\c hospital_management
```

2. Run the schema creation queries below
3. Run the seed data queries (optional)

---

## Database Schema

### 1. Users Table
Stores all users (admin, doctors, patients)

```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Doctors Table
Extended information for doctors

```sql
CREATE TABLE doctors (
    id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_specialization ON doctors(specialization);
```

### 3. Patients Table
Extended information for patients

```sql
CREATE TABLE patients (
    id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    blood_group VARCHAR(10),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Doctor Availability Table
Stores doctor weekly schedule

```sql
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
```

### 5. Time Slots Table
Stores available time slots for each day

```sql
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    availability_id INTEGER REFERENCES doctor_availability(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_slots_availability ON time_slots(availability_id);
```

### 6. Appointments Table
Stores all appointments

```sql
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

-- Prevent double booking
CREATE UNIQUE INDEX idx_unique_appointment ON appointments(doctor_id, appointment_date, appointment_time) 
WHERE status != 'cancelled';
```

### 7. Medical Records Table
Stores patient medical history

```sql
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
```

---

## Update Timestamp Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
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
```

---

## Seed Data (Sample Admin User)

```sql
-- Insert admin user (password: admin123 - you should hash this in production)
INSERT INTO users (id, email, password, role, name, phone)
VALUES ('admin-1', 'admin@hospital.com', 'admin123', 'admin', 'System Admin', '555-0000');
```

---

## Useful Queries

### Get all doctors with their details
```sql
SELECT u.*, d.specialization, d.experience
FROM users u
JOIN doctors d ON u.id = d.id
WHERE u.role = 'doctor'
ORDER BY u.name;
```

### Get all patients with their details
```sql
SELECT u.*, p.date_of_birth, p.blood_group, p.address
FROM users u
JOIN patients p ON u.id = p.id
WHERE u.role = 'patient'
ORDER BY u.name;
```

### Get doctor's schedule
```sql
SELECT da.day_of_week, da.available, ts.start_time, ts.end_time
FROM doctor_availability da
LEFT JOIN time_slots ts ON da.id = ts.availability_id
WHERE da.doctor_id = 'doc-1'
ORDER BY 
    CASE da.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END,
    ts.start_time;
```

### Get appointments for a specific date
```sql
SELECT 
    a.*,
    p.name as patient_name,
    d.name as doctor_name,
    doc.specialization
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users d ON a.doctor_id = d.id
JOIN doctors doc ON a.doctor_id = doc.id
WHERE a.appointment_date = '2024-01-15'
ORDER BY a.appointment_time;
```

### Get patient medical history
```sql
SELECT 
    mr.*,
    u.name as doctor_name,
    d.specialization
FROM medical_records mr
JOIN users u ON mr.doctor_id = u.id
JOIN doctors d ON mr.doctor_id = d.id
WHERE mr.patient_id = 'pat-1'
ORDER BY mr.record_date DESC;
```

### Statistics for admin dashboard
```sql
-- Count doctors
SELECT COUNT(*) as total_doctors FROM doctors;

-- Count patients
SELECT COUNT(*) as total_patients FROM patients;

-- Count appointments
SELECT COUNT(*) as total_appointments FROM appointments;

-- Appointments by status
SELECT status, COUNT(*) as count
FROM appointments
GROUP BY status;

-- Appointments by doctor
SELECT u.name, COUNT(a.id) as appointment_count
FROM users u
JOIN doctors d ON u.id = d.id
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY u.id, u.name
ORDER BY appointment_count DESC;
```

### Check for double booking
```sql
SELECT * FROM appointments
WHERE doctor_id = 'doc-1'
AND appointment_date = '2024-01-15'
AND appointment_time = '10:00:00'
AND status != 'cancelled';
```

---

## Drop All Tables (Use with caution!)

```sql
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```
