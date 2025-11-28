// Test script to verify prescription email sending
const emailService = require('./email-service');

const testAppointment = {
    id: 'test-apt-1',
    appointment_date: '2025-11-27',
    appointment_time: '14:00'
};

const testPatient = {
    email: 'tinashehando@gmail.com', // Using your email from .env
    name: 'Test Patient'
};

const testDoctor = {
    email: 'doctor@test.com',
    name: 'Dr. Test Doctor',
    specialization: 'General Medicine'
};

const testPrescription = {
    diagnosis: 'Common cold',
    prescription: '1. Rest for 3 days\n2. Drink plenty of fluids\n3. Take paracetamol 500mg every 6 hours',
    notes: 'Follow up if symptoms persist after 3 days'
};

console.log('Testing prescription email...');
console.log('Sending to:', testPatient.email);

emailService.sendPrescriptionEmail(testAppointment, testPatient, testDoctor, testPrescription)
    .then(() => {
        console.log('✅ Prescription email sent successfully!');
        console.log('Check your inbox at:', testPatient.email);
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed to send prescription email:');
        console.error(error);
        process.exit(1);
    });
