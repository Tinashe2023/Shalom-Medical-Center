const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all appointments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { doctorId, patientId, status, date } = req.query;

    let query = `
      SELECT 
        a.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      JOIN doctors doc ON a.doctor_id = doc.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by role
    if (req.user.role === 'doctor') {
      query += ` AND a.doctor_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'patient') {
      query += ` AND a.patient_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    // Additional filters
    if (doctorId) {
      query += ` AND a.doctor_id = $${paramCount}`;
      params.push(doctorId);
      paramCount++;
    }

    if (patientId) {
      query += ` AND a.patient_id = $${paramCount}`;
      params.push(patientId);
      paramCount++;
    }

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date) {
      query += ` AND a.appointment_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        a.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN users d ON a.doctor_id = d.id
       JOIN doctors doc ON a.doctor_id = doc.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Helper function: Check doctor's appointment load for a specific date
async function getDoctorLoad(doctorId, date) {
  const result = await db.query(
    `SELECT COUNT(*) as appointment_count
     FROM appointments
     WHERE doctor_id = $1
     AND appointment_date = $2
     AND status IN ('scheduled', 'pending')`,
    [doctorId, date]
  );

  const count = parseInt(result.rows[0].appointment_count);
  return {
    count,
    status: count >= 10 ? 'full' : count >= 8 ? 'busy' : 'available'
  };
}

// Helper function: Get next queue position for a doctor on a date
async function getNextQueuePosition(doctorId, date) {
  const result = await db.query(
    `SELECT COALESCE(MAX(queue_position), 0) + 1 as next_position
     FROM appointments
     WHERE doctor_id = $1 AND appointment_date = $2 AND status = 'queued'`,
    [doctorId, date]
  );
  return result.rows[0].next_position;
}

// Helper function: Auto-assign queued appointments when slots become available
async function processQueue(doctorId, date) {
  const load = await getDoctorLoad(doctorId, date);

  if (load.count < 8) {
    // Get next queued appointment
    const queued = await db.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND appointment_date = $2 AND status = 'queued'
       ORDER BY queue_position ASC
       LIMIT 1`,
      [doctorId, date]
    );

    if (queued.rows.length > 0) {
      // Assign appointment
      await db.query(
        `UPDATE appointments
         SET status = 'scheduled', auto_assigned = true, assigned_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [queued.rows[0].id]
      );

      // Send assignment email to patient
      try {
        const emailService = require('../email-service');
        const appointment = queued.rows[0];

        // Get patient and doctor details
        const patientResult = await db.query('SELECT * FROM users WHERE id = $1', [appointment.patient_id]);
        const doctorResult = await db.query('SELECT u.*, d.specialization FROM users u JOIN doctors d ON u.id = d.id WHERE u.id = $1', [appointment.doctor_id]);

        if (patientResult.rows.length > 0 && doctorResult.rows.length > 0) {
          await emailService.sendQueueAssignmentEmail(
            appointment,
            patientResult.rows[0],
            doctorResult.rows[0]
          );
        }
      } catch (emailError) {
        console.error('Failed to send queue assignment email:', emailError);
      }

      return queued.rows[0];
    }
  }
  return null;
}

// Create appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, allowQueue } = req.body;

    if (!patientId || !doctorId || !date || !reason) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check doctor load
    const load = await getDoctorLoad(doctorId, date);

    // If doctor is full and patient doesn't allow queue
    if (load.status === 'full' && !allowQueue) {
      return res.status(400).json({
        error: 'Doctor is fully booked for this date',
        doctorLoad: load,
        canQueue: true
      });
    }

    const appointmentId = `apt-${Date.now()}`;
    let status = 'scheduled';
    let queuePosition = null;

    // If doctor is full and patient allows queue
    if (load.status === 'full' && allowQueue) {
      status = 'queued';
      queuePosition = await getNextQueuePosition(doctorId, date);

      // Create queued appointment (no specific time slot)
      await db.query(
        `INSERT INTO appointments 
         (id, patient_id, doctor_id, appointment_date, appointment_time, reason, status, queue_position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [appointmentId, patientId, doctorId, date, time || '00:00', reason, status, queuePosition]
      );
    } else {
      // Check for double booking only if scheduling (not queuing)
      if (time) {
        const conflict = await db.query(
          `SELECT id FROM appointments
           WHERE doctor_id = $1
           AND appointment_date = $2
           AND appointment_time = $3
           AND status != 'cancelled'`,
          [doctorId, date, time]
        );

        if (conflict.rows.length > 0) {
          return res.status(400).json({ error: 'Time slot already booked' });
        }
      }

      // Create scheduled appointment
      await db.query(
        `INSERT INTO appointments 
         (id, patient_id, doctor_id, appointment_date, appointment_time, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')`,
        [appointmentId, patientId, doctorId, date, time, reason]
      );
    }

    // Get the created appointment with full details
    const newAppt = await db.query(
      `SELECT 
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        d.name as doctor_name,
        d.email as doctor_email,
        doc.specialization
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN users d ON a.doctor_id = d.id
       JOIN doctors doc ON a.doctor_id = doc.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    const appointment = newAppt.rows[0];

    // Send email notifications
    try {
      const emailService = require('../email-service');

      if (status === 'scheduled') {
        // Send confirmation to patient and notification to doctor
        await emailService.sendAppointmentConfirmationEmail(
          appointment,
          { email: appointment.patient_email, name: appointment.patient_name },
          { email: appointment.doctor_email, name: appointment.doctor_name, specialization: appointment.specialization }
        );
        await emailService.sendDoctorAppointmentNotification(
          appointment,
          { email: appointment.doctor_email, name: appointment.doctor_name },
          { email: appointment.patient_email, name: appointment.patient_name }
        );
      } else if (status === 'queued') {
        // Send queue confirmation to patient
        await emailService.sendQueueConfirmationEmail(
          appointment,
          { email: appointment.patient_email, name: appointment.patient_name },
          { email: appointment.doctor_email, name: appointment.doctor_name, specialization: appointment.specialization },
          queuePosition
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      ...appointment,
      message: status === 'queued' ? `Added to waitlist at position ${queuePosition}` : 'Appointment scheduled successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, reason, status, diagnosis, prescription, notes } = req.body;

    // Check authorization
    const existing = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = existing.rows[0];

    // Patients can only cancel their own appointments
    if (req.user.role === 'patient' && req.user.id !== appointment.patient_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Doctors can only update their own appointments
    if (req.user.role === 'doctor' && req.user.id !== appointment.doctor_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check for conflicts if date/time changed
    if (date && time && (date !== appointment.appointment_date || time !== appointment.appointment_time)) {
      const conflict = await db.query(
        `SELECT id FROM appointments
         WHERE doctor_id = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status != 'cancelled'
         AND id != $4`,
        [appointment.doctor_id, date, time, id]
      );

      if (conflict.rows.length > 0) {
        return res.status(400).json({ error: 'Time slot already booked' });
      }
    }

    let updateQuery = 'UPDATE appointments SET ';
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (date) {
      updates.push(`appointment_date = $${paramCount}`);
      params.push(date);
      paramCount++;
    }
    if (time) {
      updates.push(`appointment_time = $${paramCount}`);
      params.push(time);
      paramCount++;
    }
    if (reason) {
      updates.push(`reason = $${paramCount}`);
      params.push(reason);
      paramCount++;
    }
    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
      if (status === 'completed') {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }
    }
    if (diagnosis) {
      updates.push(`diagnosis = $${paramCount}`);
      params.push(diagnosis);
      paramCount++;
    }
    if (prescription) {
      updates.push(`prescription = $${paramCount}`);
      params.push(prescription);
      paramCount++;
    }
    if (notes) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateQuery += updates.join(', ');
    updateQuery += ` WHERE id = $${paramCount}`;
    params.push(id);

    await db.query(updateQuery, params);

    const updated = await db.query(
      `SELECT 
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        d.name as doctor_name,
        d.email as doctor_email,
        doc.specialization
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN users d ON a.doctor_id = d.id
       JOIN doctors doc ON a.doctor_id = doc.id
       WHERE a.id = $1`,
      [id]
    );

    const updatedAppointment = updated.rows[0];

    // If appointment was cancelled or completed, process queue
    if (status === 'cancelled' || status === 'completed') {
      try {
        await processQueue(updatedAppointment.doctor_id, updatedAppointment.appointment_date);
      } catch (queueError) {
        console.error('Error processing queue:', queueError);
        // Don't fail the request if queue processing fails
      }
    }

    // Send prescription email if appointment completed with prescription
    if (status === 'completed' && (diagnosis || prescription)) {
      try {
        const emailService = require('../email-service');
        await emailService.sendPrescriptionEmail(
          updatedAppointment,
          { email: updatedAppointment.patient_email, name: updatedAppointment.patient_name },
          { email: updatedAppointment.doctor_email, name: updatedAppointment.doctor_name, specialization: updatedAppointment.specialization },
          { diagnosis, prescription, notes }
        );
      } catch (emailError) {
        console.error('Failed to send prescription email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM appointments WHERE id = $1', [id]);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;
