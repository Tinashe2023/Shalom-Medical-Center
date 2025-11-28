const bcrypt = require('bcryptjs');
const db = require('./db');

async function updatePasswords() {
    try {
        console.log('Generating bcrypt hashes...');

        const adminHash = await bcrypt.hash('admin123', 10);
        const doctorHash = await bcrypt.hash('doctor123', 10);
        const patientHash = await bcrypt.hash('patient123', 10);

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
        console.log('\nYou can now login with:');
        console.log('Admin: admin@hospital.com / admin123');
        console.log('Doctor: dr.smith@hospital.com / doctor123');
        console.log('Patient: john.doe@email.com / patient123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updatePasswords();
