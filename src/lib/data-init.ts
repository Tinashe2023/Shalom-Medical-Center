// Initialize sample data for the application
export const initializeData = () => {
  // Admin user (pre-created)
  const admin = {
    id: 'admin-1',
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Admin'
  };

  // Sample doctors
  const doctors = [
    {
      id: 'doc-1',
      email: 'dr.smith@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Sarah Smith',
      specialization: 'Cardiology',
      phone: '555-0101',
      experience: '15 years',
      availability: generateDefaultAvailability()
    },
    {
      id: 'doc-2',
      email: 'dr.johnson@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Michael Johnson',
      specialization: 'Pediatrics',
      phone: '555-0102',
      experience: '12 years',
      availability: generateDefaultAvailability()
    },
    {
      id: 'doc-3',
      email: 'dr.williams@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Emily Williams',
      specialization: 'Dermatology',
      phone: '555-0103',
      experience: '10 years',
      availability: generateDefaultAvailability()
    },
    {
      id: 'doc-4',
      email: 'dr.brown@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. James Brown',
      specialization: 'Orthopedics',
      phone: '555-0104',
      experience: '18 years',
      availability: generateDefaultAvailability()
    },
    {
      id: 'doc-5',
      email: 'dr.davis@hospital.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Lisa Davis',
      specialization: 'Neurology',
      phone: '555-0105',
      experience: '14 years',
      availability: generateDefaultAvailability()
    }
  ];

  // Sample patients
  const patients = [
    {
      id: 'pat-1',
      email: 'john.doe@email.com',
      password: 'patient123',
      role: 'patient',
      name: 'John Doe',
      phone: '555-1001',
      dateOfBirth: '1985-05-15',
      bloodGroup: 'A+',
      address: '123 Main St, City, State'
    },
    {
      id: 'pat-2',
      email: 'jane.smith@email.com',
      password: 'patient123',
      role: 'patient',
      name: 'Jane Smith',
      phone: '555-1002',
      dateOfBirth: '1990-08-22',
      bloodGroup: 'O+',
      address: '456 Oak Ave, City, State'
    },
    {
      id: 'pat-3',
      email: 'robert.wilson@email.com',
      password: 'patient123',
      role: 'patient',
      name: 'Robert Wilson',
      phone: '555-1003',
      dateOfBirth: '1978-03-10',
      bloodGroup: 'B+',
      address: '789 Pine Rd, City, State'
    }
  ];

  // Sample appointments
  const today = new Date();
  const appointments = [
    {
      id: 'apt-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      date: formatDate(addDays(today, 1)),
      time: '10:00',
      status: 'scheduled',
      reason: 'Regular checkup',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-2',
      patientId: 'pat-2',
      doctorId: 'doc-2',
      date: formatDate(addDays(today, 2)),
      time: '14:00',
      status: 'scheduled',
      reason: 'Child vaccination',
      createdAt: new Date().toISOString()
    },
    {
      id: 'apt-3',
      patientId: 'pat-3',
      doctorId: 'doc-3',
      date: formatDate(addDays(today, -5)),
      time: '11:00',
      status: 'completed',
      reason: 'Skin rash',
      diagnosis: 'Contact dermatitis',
      prescription: 'Hydrocortisone cream, apply twice daily',
      notes: 'Patient advised to avoid allergens',
      createdAt: new Date().toISOString()
    }
  ];

  // Sample medical records
  const medicalRecords = [
    {
      id: 'rec-1',
      patientId: 'pat-1',
      doctorId: 'doc-1',
      appointmentId: 'apt-3',
      date: formatDate(addDays(today, -30)),
      diagnosis: 'Hypertension',
      prescription: 'Lisinopril 10mg daily',
      notes: 'Monitor blood pressure regularly',
      vitals: {
        bloodPressure: '140/90',
        heartRate: '78',
        temperature: '98.6'
      }
    },
    {
      id: 'rec-2',
      patientId: 'pat-2',
      doctorId: 'doc-2',
      appointmentId: 'apt-3',
      date: formatDate(addDays(today, -15)),
      diagnosis: 'Common cold',
      prescription: 'Rest and fluids',
      notes: 'Symptoms should resolve in 7-10 days',
      vitals: {
        temperature: '99.2',
        heartRate: '82'
      }
    }
  ];

  // Store data
  localStorage.setItem('users', JSON.stringify([admin, ...doctors, ...patients]));
  localStorage.setItem('appointments', JSON.stringify(appointments));
  localStorage.setItem('medical_records', JSON.stringify(medicalRecords));
};

function generateDefaultAvailability() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map(day => ({
    day,
    available: day !== 'Sunday',
    slots: day !== 'Sunday' ? [
      { start: '09:00', end: '12:00' },
      { start: '14:00', end: '17:00' }
    ] : []
  }));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const generateDoctorData = () => {
  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General Medicine', 'Psychiatry'];
  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer'];
  const lastNames = ['Anderson', 'Taylor', 'Martinez', 'Garcia', 'Rodriguez', 'Lee', 'Walker', 'Hall'];
  
  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomSpec = specializations[Math.floor(Math.random() * specializations.length)];
  
  return {
    id: `doc-${Date.now()}`,
    email: `dr.${randomLast.toLowerCase()}${Math.floor(Math.random() * 1000)}@hospital.com`,
    password: 'doctor123',
    role: 'doctor',
    name: `Dr. ${randomFirst} ${randomLast}`,
    specialization: randomSpec,
    phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    experience: `${Math.floor(5 + Math.random() * 20)} years`,
    availability: generateDefaultAvailability()
  };
};

export const generatePatientData = () => {
  const firstNames = ['Alex', 'Chris', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Drew'];
  const lastNames = ['Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    id: `pat-${Date.now()}`,
    email: `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${Math.floor(Math.random() * 1000)}@email.com`,
    password: 'patient123',
    role: 'patient',
    name: `${randomFirst} ${randomLast}`,
    phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    dateOfBirth: `19${Math.floor(60 + Math.random() * 40)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`,
    bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
    address: `${Math.floor(100 + Math.random() * 900)} ${['Main', 'Oak', 'Pine', 'Maple'][Math.floor(Math.random() * 4)]} St, City, State`
  };
};
