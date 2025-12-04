const bcrypt = require('bcryptjs');
require('dotenv').config();

async function generateHashes() {
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

    const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    const doctorHash = await bcrypt.hash(process.env.SEED_DOCTOR_PASSWORD, 10);
    const patientHash = await bcrypt.hash(process.env.SEED_PATIENT_PASSWORD, 10);

    console.log('Generated password hashes for database:');
    console.log('Admin hash:', adminHash);
    console.log('Doctor hash:', doctorHash);
    console.log('Patient hash:', patientHash);

    console.log('\n\nSQL to update:');
    console.log(`UPDATE users SET password = '${adminHash}' WHERE email = 'admin@hospital.com';`);
    console.log(`UPDATE users SET password = '${doctorHash}' WHERE email LIKE 'dr.%@hospital.com';`);
    console.log(`UPDATE users SET password = '${patientHash}' WHERE role = 'patient';`);
}

generateHashes();
