const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

async function updatePasswords() {
    try {
        // Validate environment variables
        if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_DOCTOR_PASSWORD || !process.env.SEED_PATIENT_PASSWORD) {
            console.error('ERROR: Required environment variables are missing!');
            console.error('Please set the following in your .env file:');
            console.error('  - SEED_ADMIN_PASSWORD');
            console.error('  - SEED_DOCTOR_PASSWORD');
            console.error('  - SEED_PATIENT_PASSWORD');
            console.error('\nSee .env.example for reference.');
            process.exit(1);
        }

        console.log('Generating bcrypt hashes...');

        const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
        const doctorHash = await bcrypt.hash(process.env.SEED_DOCTOR_PASSWORD, 10);
        const patientHash = await bcrypt.hash(process.env.SEED_PATIENT_PASSWORD, 10);

        console.log('\nUpdating passwords in database...');

        // Update admin
        await db.query(`UPDATE users SET password = $1 WHERE email = 'admin@hospital.com'`, [adminHash]);
        console.log('✓ Updated admin password');

        // Update all doctors
        const doctorsResult = await db.query(`UPDATE users SET password = $1 WHERE role = 'doctor'`, [doctorHash]);
        console.log(`✓ Updated ${doctorsResult.rowCount} doctor password(s)`);

        // Update all patients
        const patientsResult = await db.query(`UPDATE users SET password = $1 WHERE role = 'patient'`, [patientHash]);
        console.log(`✓ Updated ${patientsResult.rowCount} patient password(s)`);

        console.log('\n✓ All passwords updated successfully!');
        console.log('\nYou can now login with the passwords set in your .env file:');
        console.log('Admin: admin@hospital.com');
        console.log('Doctor: dr.smith@hospital.com');
        console.log('Patient: john.doe@email.com');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updatePasswords();
