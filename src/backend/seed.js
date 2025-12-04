const db = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

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

    // Hash passwords from environment variables
    const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
    const doctorPassword = await bcrypt.hash(process.env.SEED_DOCTOR_PASSWORD, 10);
    const patientPassword = await bcrypt.hash(process.env.SEED_PATIENT_PASSWORD, 10);

    // Delete existing seed data first
    console.log('Clearing existing seed data...');
    await db.query(`DELETE FROM medical_records WHERE id IN ('rec-1', 'rec-2')`);
    await db.query(`DELETE FROM appointments WHERE id IN ('apt-1', 'apt-2', 'apt-3')`);
    await db.query(`
      DELETE FROM time_slots WHERE availability_id IN (
        SELECT id FROM doctor_availability WHERE doctor_id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5')
      )
    `);
    await db.query(`DELETE FROM doctor_availability WHERE doctor_id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5')`);
    await db.query(`DELETE FROM patients WHERE id IN ('pat-1', 'pat-2', 'pat-3')`);
    await db.query(`DELETE FROM doctors WHERE id IN ('doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5')`);
    await db.query(`DELETE FROM users WHERE id IN ('admin-1', 'doc-1', 'doc-2', 'doc-3', 'doc-4', 'doc-5', 'pat-1', 'pat-2', 'pat-3')`);

    // Create admin user
    console.log('Creating admin user...');
    await db.query(`
      INSERT INTO users (id, email, password, role, name, phone, email_verified)
      VALUES ('admin-1', 'admin@hospital.com', $1, 'admin', 'System Admin', '555-0000', true)
    `, [adminPassword]);

    // Create sample doctors
    console.log('Creating sample doctors...');
    const doctors = [
      {
        id: 'doc-1',
        email: 'dr.smith@hospital.com',
        name: 'Dr. Sarah Smith',
        specialization: 'Cardiology',
        phone: '555-0101',
        experience: '15 years'
      },
      {
        id: 'doc-2',
        email: 'dr.johnson@hospital.com',
        name: 'Dr. Michael Johnson',
        specialization: 'Pediatrics',
        phone: '555-0102',
        experience: '12 years'
      },
      {
        id: 'doc-3',
        email: 'dr.williams@hospital.com',
        name: 'Dr. Emily Williams',
        specialization: 'Dermatology',
        phone: '555-0103',
        experience: '10 years'
      },
      {
        id: 'doc-4',
        email: 'dr.brown@hospital.com',
        name: 'Dr. James Brown',
        specialization: 'Orthopedics',
        phone: '555-0104',
        experience: '18 years'
      },
      {
        id: 'doc-5',
        email: 'dr.davis@hospital.com',
        name: 'Dr. Lisa Davis',
        specialization: 'Neurology',
        phone: '555-0105',
        experience: '14 years'
      }
    ];

    for (const doctor of doctors) {
      // Insert user
      await db.query(`
        INSERT INTO users (id, email, password, role, name, phone, email_verified)
        VALUES ($1, $2, $3, 'doctor', $4, $5, true)
      `, [doctor.id, doctor.email, doctorPassword, doctor.name, doctor.phone]);

      // Insert doctor info
      await db.query(`
        INSERT INTO doctors (id, specialization, experience)
        VALUES ($1, $2, $3)
      `, [doctor.id, doctor.specialization, doctor.experience]);

      // Create availability
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        const available = day !== 'Sunday';

        const availResult = await db.query(`
          INSERT INTO doctor_availability (doctor_id, day_of_week, available)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [doctor.id, day, available]);

        if (available && availResult.rows.length > 0) {
          const availId = availResult.rows[0].id;

          // Insert time slots
          await db.query(`
            INSERT INTO time_slots (availability_id, start_time, end_time)
            VALUES ($1, '09:00', '12:00'), ($1, '14:00', '17:00')
          `, [availId]);
        }
      }
    }

    // Create sample patients
    console.log('Creating sample patients...');
    const patients = [
      {
        id: 'pat-1',
        email: 'john.doe@email.com',
        name: 'John Doe',
        phone: '555-1001',
        dateOfBirth: '1985-05-15',
        bloodGroup: 'A+',
        address: '123 Main St, City, State'
      },
      {
        id: 'pat-2',
        email: 'jane.smith@email.com',
        name: 'Jane Smith',
        phone: '555-1002',
        dateOfBirth: '1990-08-22',
        bloodGroup: 'O+',
        address: '456 Oak Ave, City, State'
      },
      {
        id: 'pat-3',
        email: 'robert.wilson@email.com',
        name: 'Robert Wilson',
        phone: '555-1003',
        dateOfBirth: '1978-03-10',
        bloodGroup: 'B+',
        address: '789 Pine Rd, City, State'
      }
    ];

    for (const patient of patients) {
      // Insert user
      await db.query(`
        INSERT INTO users (id, email, password, role, name, phone, email_verified)
        VALUES ($1, $2, $3, 'patient', $4, $5, true)
      `, [patient.id, patient.email, patientPassword, patient.name, patient.phone]);

      // Insert patient info
      await db.query(`
        INSERT INTO patients (id, date_of_birth, blood_group, address)
        VALUES ($1, $2, $3, $4)
      `, [patient.id, patient.dateOfBirth, patient.bloodGroup, patient.address]);
    }

    // Create sample appointments
    console.log('Creating sample appointments...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 5);

    const appointments = [
      {
        id: 'apt-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        reason: 'Regular checkup'
      },
      {
        id: 'apt-2',
        patientId: 'pat-2',
        doctorId: 'doc-2',
        date: dayAfter.toISOString().split('T')[0],
        time: '14:00',
        reason: 'Child vaccination'
      },
      {
        id: 'apt-3',
        patientId: 'pat-3',
        doctorId: 'doc-3',
        date: pastDate.toISOString().split('T')[0],
        time: '11:00',
        reason: 'Skin rash',
        status: 'completed',
        diagnosis: 'Contact dermatitis',
        prescription: 'Hydrocortisone cream, apply twice daily',
        notes: 'Patient advised to avoid allergens'
      }
    ];

    for (const apt of appointments) {
      await db.query(`
        INSERT INTO appointments 
        (id, patient_id, doctor_id, appointment_date, appointment_time, reason, status, diagnosis, prescription, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        apt.id,
        apt.patientId,
        apt.doctorId,
        apt.date,
        apt.time,
        apt.reason,
        apt.status || 'scheduled',
        apt.diagnosis || null,
        apt.prescription || null,
        apt.notes || null
      ]);
    }

    // Create sample medical records
    console.log('Creating sample medical records...');
    const records = [
      {
        id: 'rec-1',
        patientId: 'pat-1',
        doctorId: 'doc-1',
        date: pastDate.toISOString().split('T')[0],
        diagnosis: 'Hypertension',
        prescription: 'Lisinopril 10mg daily',
        notes: 'Monitor blood pressure regularly',
        bp: '140/90',
        hr: '78',
        temp: '98.6'
      },
      {
        id: 'rec-2',
        patientId: 'pat-2',
        doctorId: 'doc-2',
        date: pastDate.toISOString().split('T')[0],
        diagnosis: 'Common cold',
        prescription: 'Rest and fluids',
        notes: 'Symptoms should resolve in 7-10 days',
        temp: '99.2',
        hr: '82'
      }
    ];

    for (const record of records) {
      await db.query(`
        INSERT INTO medical_records 
        (id, patient_id, doctor_id, record_date, diagnosis, prescription, notes, blood_pressure, heart_rate, temperature)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        record.id,
        record.patientId,
        record.doctorId,
        record.date,
        record.diagnosis,
        record.prescription,
        record.notes,
        record.bp || null,
        record.hr || null,
        record.temp || null
      ]);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nDefault user accounts created:');
    console.log('Admin: admin@hospital.com');
    console.log('Doctor: dr.smith@hospital.com (and 4 others)');
    console.log('Patient: john.doe@email.com (and 2 others)');
    console.log('\nUse the passwords you set in your .env file to login.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
