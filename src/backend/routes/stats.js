const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get admin dashboard statistics
router.get('/admin', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Total counts
    const doctorCount = await db.query('SELECT COUNT(*) as count FROM doctors');
    const patientCount = await db.query('SELECT COUNT(*) as count FROM patients');
    const appointmentCount = await db.query('SELECT COUNT(*) as count FROM appointments');
    
    // Appointments by status
    const statusStats = await db.query(`
      SELECT status, COUNT(*) as count
      FROM appointments
      GROUP BY status
    `);
    
    // Appointments by doctor
    const doctorStats = await db.query(`
      SELECT u.name, COUNT(a.id) as count
      FROM users u
      JOIN doctors d ON u.id = d.id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY u.id, u.name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Specialization distribution
    const specializationStats = await db.query(`
      SELECT specialization, COUNT(*) as count
      FROM doctors
      GROUP BY specialization
      ORDER BY count DESC
    `);
    
    // Weekly appointments (last 7 days)
    const weeklyStats = await db.query(`
      SELECT 
        appointment_date,
        COUNT(*) as count
      FROM appointments
      WHERE appointment_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY appointment_date
      ORDER BY appointment_date
    `);
    
    res.json({
      totals: {
        doctors: parseInt(doctorCount.rows[0].count),
        patients: parseInt(patientCount.rows[0].count),
        appointments: parseInt(appointmentCount.rows[0].count)
      },
      appointmentsByStatus: statusStats.rows,
      appointmentsByDoctor: doctorStats.rows,
      specializationDistribution: specializationStats.rows,
      weeklyAppointments: weeklyStats.rows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get doctor dashboard statistics
router.get('/doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Verify authorization
    if (req.user.role === 'doctor' && req.user.id !== doctorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Today's appointments
    const todayAppts = await db.query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
      AND appointment_date = CURRENT_DATE
      AND status = 'scheduled'
    `, [doctorId]);
    
    // Upcoming appointments
    const upcomingAppts = await db.query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE doctor_id = $1
      AND appointment_date >= CURRENT_DATE
      AND status = 'scheduled'
    `, [doctorId]);
    
    // Total unique patients
    const uniquePatients = await db.query(`
      SELECT COUNT(DISTINCT patient_id) as count
      FROM appointments
      WHERE doctor_id = $1
    `, [doctorId]);
    
    res.json({
      todayAppointments: parseInt(todayAppts.rows[0].count),
      upcomingAppointments: parseInt(upcomingAppts.rows[0].count),
      totalPatients: parseInt(uniquePatients.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get patient dashboard statistics
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify authorization
    if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Upcoming appointments
    const upcomingAppts = await db.query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE patient_id = $1
      AND appointment_date >= CURRENT_DATE
      AND status = 'scheduled'
    `, [patientId]);
    
    // Completed appointments
    const completedAppts = await db.query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE patient_id = $1
      AND status = 'completed'
    `, [patientId]);
    
    // Medical records count
    const recordsCount = await db.query(`
      SELECT COUNT(*) as count
      FROM medical_records
      WHERE patient_id = $1
    `, [patientId]);
    
    res.json({
      upcomingAppointments: parseInt(upcomingAppts.rows[0].count),
      completedAppointments: parseInt(completedAppts.rows[0].count),
      medicalRecords: parseInt(recordsCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
