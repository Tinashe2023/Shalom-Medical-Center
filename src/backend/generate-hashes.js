const bcrypt = require('bcryptjs');

async function generateHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const doctorHash = await bcrypt.hash('doctor123', 10);
    const patientHash = await bcrypt.hash('patient123', 10);

    console.log('Admin hash:', adminHash);
    console.log('Doctor hash:', doctorHash);
    console.log('Patient hash:', patientHash);

    console.log('\n\nSQL to update:');
    console.log(`UPDATE users SET password = '${adminHash}' WHERE email = 'admin@hospital.com';`);
    console.log(`UPDATE users SET password = '${doctorHash}' WHERE email LIKE 'dr.%@hospital.com';`);
    console.log(`UPDATE users SET password = '${patientHash}' WHERE role = 'patient';`);
}

generateHashes();
