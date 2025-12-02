const db = require('./db');

// LMStudio server configuration (OpenAI-compatible API)
const LMSTUDIO_BASE_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234';
let isConnected = false;

// Connect to LMStudio (check if server is running)
async function connectToLMStudio() {
    try {
        const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/models`);
        if (response.ok) {
            isConnected = true;
            console.log('LMStudio server is reachable');
            return true;
        }
        isConnected = false;
        return false;
    } catch (error) {
        console.error('Failed to connect to LMStudio:', error.message);
        isConnected = false;
        return false;
    }
}

// Database query tools that the AI can use
const databaseTools = {
    // Get patient's appointments
    async getPatientAppointments(patientId, status = null) {
        try {
            let query = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.reason, a.status,
          a.diagnosis, a.prescription, a.notes,
          u.name as doctor_name, d.specialization
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.id = u.id
        WHERE a.patient_id = $1
      `;
            const params = [patientId];

            if (status) {
                query += ' AND a.status = $2';
                params.push(status);
            }

            query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

            const result = await db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error fetching patient appointments:', error);
            return [];
        }
    },

    // Get patient's medical records
    async getPatientMedicalRecords(patientId, limit = 10) {
        try {
            const query = `
        SELECT 
          mr.id, mr.record_date, mr.diagnosis, mr.prescription, mr.notes,
          mr.blood_pressure, mr.heart_rate, mr.temperature,
          u.name as doctor_name, d.specialization
        FROM medical_records mr
        JOIN doctors d ON mr.doctor_id = d.id
        JOIN users u ON d.id = u.id
        WHERE mr.patient_id = $1
        ORDER BY mr.record_date DESC
        LIMIT $2
      `;
            const result = await db.query(query, [patientId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching medical records:', error);
            return [];
        }
    },

    // Get patient profile
    async getPatientProfile(patientId) {
        try {
            const query = `
        SELECT 
          u.name, u.email, u.phone,
          p.date_of_birth, p.blood_group, p.address
        FROM users u
        JOIN patients p ON u.id = p.id
        WHERE u.id = $1
      `;
            const result = await db.query(query, [patientId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching patient profile:', error);
            return null;
        }
    },

    // Get doctor's schedule for a specific date
    async getDoctorSchedule(doctorId, date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            const query = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.reason, a.status,
          u.name as patient_name, p.blood_group
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON p.id = u.id
        WHERE a.doctor_id = $1 AND a.appointment_date = $2
        ORDER BY a.appointment_time ASC
      `;
            const result = await db.query(query, [doctorId, targetDate]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching doctor schedule:', error);
            return [];
        }
    },

    // Get doctor's appointment statistics
    async getDoctorStats(doctorId) {
        try {
            const query = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
          COUNT(*) as total_appointments
        FROM appointments
        WHERE doctor_id = $1
      `;
            const result = await db.query(query, [doctorId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching doctor stats:', error);
            return null;
        }
    },

    // Get available doctors by specialization
    async getAvailableDoctors(specialization = null, date = null) {
        try {
            let query = `
        SELECT 
          u.id, u.name, u.email, u.phone,
          d.specialization, d.experience
        FROM users u
        JOIN doctors d ON u.id = d.id
        WHERE u.role = 'doctor'
      `;
            const params = [];

            if (specialization) {
                params.push(specialization);
                query += ` AND d.specialization ILIKE $${params.length}`;
            }

            query += ' ORDER BY u.name ASC';

            const result = await db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error fetching available doctors:', error);
            return [];
        }
    },

    // Get system statistics (admin only)
    async getSystemStats() {
        try {
            const queries = {
                totalPatients: 'SELECT COUNT(*) as count FROM patients',
                totalDoctors: 'SELECT COUNT(*) as count FROM doctors',
                totalAppointments: 'SELECT COUNT(*) as count FROM appointments',
                scheduledAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'",
                completedAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'",
                cancelledAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'",
            };

            const stats = {};
            for (const [key, query] of Object.entries(queries)) {
                const result = await db.query(query);
                stats[key] = parseInt(result.rows[0].count);
            }

            return stats;
        } catch (error) {
            console.error('Error fetching system stats:', error);
            return null;
        }
    },

    // Get top doctors by appointment count
    async getTopDoctors(limit = 5) {
        try {
            const query = `
        SELECT 
          u.name, d.specialization,
          COUNT(a.id) as appointment_count
        FROM doctors d
        JOIN users u ON d.id = u.id
        LEFT JOIN appointments a ON d.id = a.doctor_id
        GROUP BY u.name, d.specialization
        ORDER BY appointment_count DESC
        LIMIT $1
      `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching top doctors:', error);
            return [];
        }
    },

    // Get recent appointments (admin view)
    async getRecentAppointments(limit = 10) {
        try {
            const query = `
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status,
          p_user.name as patient_name,
          d_user.name as doctor_name,
          d.specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users p_user ON p.id = p_user.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users d_user ON d.id = d_user.id
        ORDER BY a.created_at DESC
        LIMIT $1
      `;
            const result = await db.query(query, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching recent appointments:', error);
            return [];
        }
    }
};

// Get role-based system prompt
function getSystemPrompt(role, userId) {
    const basePrompt = `You are a helpful AI assistant for Shalom Medical Center, a hospital management system. 
You have access to the hospital's database and can provide accurate, real-time information.

IMPORTANT GUIDELINES:
- Always be professional, empathetic, and clear in your responses
- Provide accurate information based on the database data
- If you don't have information, say so clearly
- For medical advice, always remind users to consult with their healthcare provider
- Respect patient privacy and data confidentiality
- Format your responses in a clear, easy-to-read manner

`;

    const rolePrompts = {
        patient: `ROLE: You are assisting a PATIENT (ID: ${userId})

You can help them with:
- Viewing their upcoming and past appointments
- Checking their medical history and records
- Finding available doctors by specialization
- Understanding how to book appointments
- General questions about the hospital services

LIMITATIONS:
- You can ONLY access this patient's own data
- You cannot book, modify, or cancel appointments (they must use the UI)
- You cannot access other patients' information
- You cannot provide medical diagnoses or treatment advice`,

        doctor: `ROLE: You are assisting a DOCTOR (ID: ${userId})

You can help them with:
- Viewing their daily schedule and appointments
- Accessing patient information for their appointments
- Checking appointment statistics and workload
- Finding patient medical history
- General administrative queries

LIMITATIONS:
- You can access information about patients who have appointments with this doctor
- You cannot modify appointments or medical records (they must use the UI)
- You cannot access unrelated patients' data`,

        admin: `ROLE: You are assisting an ADMINISTRATOR (ID: ${userId})

You can help them with:
- System-wide statistics and analytics
- Viewing all appointments, patients, and doctors
- Identifying trends and patterns
- Generating insights for decision-making
- Managing operational queries

CAPABILITIES:
- Full read access to all system data
- Can provide comprehensive analytics and reports
- Can help identify operational improvements

LIMITATIONS:
- You cannot modify any data (they must use the UI)
- You provide insights, not make decisions`
    };

    return basePrompt + (rolePrompts[role] || rolePrompts.patient);
}

// Main chat function
async function chat(message, userRole, userId, conversationHistory = []) {
    try {
        // Ensure connection
        if (!isConnected) {
            await connectToLMStudio();
        }

        if (!isConnected) {
            throw new Error('LMStudio is not running. Please start LMStudio and try again.');
        }

        // Build context with database information
        let contextMessage = '';

        // Fetch relevant data based on role and query
        if (userRole === 'patient') {
            // For patients, fetch their appointments and basic info
            const appointments = await databaseTools.getPatientAppointments(userId);
            const profile = await databaseTools.getPatientProfile(userId);

            if (message.toLowerCase().includes('appointment')) {
                contextMessage += `\n\nPatient's Appointments:\n${JSON.stringify(appointments, null, 2)}`;
            }
            if (message.toLowerCase().includes('medical') || message.toLowerCase().includes('history') || message.toLowerCase().includes('record')) {
                const records = await databaseTools.getPatientMedicalRecords(userId);
                contextMessage += `\n\nMedical Records:\n${JSON.stringify(records, null, 2)}`;
            }
            if (message.toLowerCase().includes('profile') || message.toLowerCase().includes('information')) {
                contextMessage += `\n\nPatient Profile:\n${JSON.stringify(profile, null, 2)}`;
            }
            if (message.toLowerCase().includes('doctor')) {
                const doctors = await databaseTools.getAvailableDoctors();
                contextMessage += `\n\nAvailable Doctors:\n${JSON.stringify(doctors, null, 2)}`;
            }
        } else if (userRole === 'doctor') {
            // For doctors, fetch their schedule and stats
            if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('appointment') || message.toLowerCase().includes('today')) {
                const schedule = await databaseTools.getDoctorSchedule(userId);
                contextMessage += `\n\nToday's Schedule:\n${JSON.stringify(schedule, null, 2)}`;
            }
            if (message.toLowerCase().includes('stat') || message.toLowerCase().includes('count') || message.toLowerCase().includes('total')) {
                const stats = await databaseTools.getDoctorStats(userId);
                contextMessage += `\n\nAppointment Statistics:\n${JSON.stringify(stats, null, 2)}`;
            }
        } else if (userRole === 'admin') {
            // For admins, fetch system-wide data
            if (message.toLowerCase().includes('stat') || message.toLowerCase().includes('total') || message.toLowerCase().includes('system')) {
                const stats = await databaseTools.getSystemStats();
                contextMessage += `\n\nSystem Statistics:\n${JSON.stringify(stats, null, 2)}`;
            }
            if (message.toLowerCase().includes('top') || message.toLowerCase().includes('doctor')) {
                const topDoctors = await databaseTools.getTopDoctors();
                contextMessage += `\n\nTop Doctors:\n${JSON.stringify(topDoctors, null, 2)}`;
            }
            if (message.toLowerCase().includes('recent') || message.toLowerCase().includes('appointment')) {
                const recent = await databaseTools.getRecentAppointments();
                contextMessage += `\n\nRecent Appointments:\n${JSON.stringify(recent, null, 2)}`;
            }
        }

        // Build messages array for OpenAI-compatible API
        const messages = [
            {
                role: 'system',
                content: getSystemPrompt(userRole, userId)
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message + contextMessage
            }
        ];

        // Call LMStudio's OpenAI-compatible API
        const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`LMStudio API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        return {
            success: true,
            message: aiMessage,
            model: data.model || 'qwen3-4b-3507'
        };

    } catch (error) {
        console.error('AI chat error:', error);

        // Provide helpful error messages
        if (error.message.includes('not running') || error.message.includes('ECONNREFUSED')) {
            return {
                success: false,
                error: 'LMStudio is not running. Please start LMStudio and ensure the server is running on port 1234.',
                details: error.message
            };
        } else if (error.message.includes('model')) {
            return {
                success: false,
                error: 'Model not found. Please download the model using: lms get qwen/qwen3-4b-2507',
                details: error.message
            };
        } else {
            return {
                success: false,
                error: 'An error occurred while processing your request.',
                details: error.message
            };
        }
    }
}

// Initialize connection on module load
connectToLMStudio();

module.exports = {
    chat,
    databaseTools,
    connectToLMStudio
};
