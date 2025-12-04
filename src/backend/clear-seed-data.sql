-- Clear existing seed data to allow re-seeding
-- This script safely removes sample data while preserving the schema

-- Delete in reverse order of dependencies
DELETE FROM medical_records WHERE id IN ('rec-1', 'rec-2');
DELETE FROM appointments WHERE id IN ('apt-1', 'apt-2', 'apt-3');
DELETE FROM time_slots WHERE availability_id IN (
    SELECT id FROM doctor_availability WHERE doctor_id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5')
);
DELETE FROM doctor_availability WHERE doctor_id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5');
DELETE FROM patients WHERE id IN ('pat-1', 'pat-2', 'pat-3');
DELETE FROM doctors WHERE id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5');
DELETE FROM users WHERE id IN ('admin-1', 'doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'pat-1', 'pat-2', 'pat-3');

-- Success message
SELECT 'Sample data cleared successfully. You can now run seed.js' AS message;
