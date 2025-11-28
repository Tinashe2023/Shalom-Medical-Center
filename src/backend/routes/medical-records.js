const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get medical records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
      FROM medical_records mr
      JOIN users p ON mr.patient_id = p.id
      JOIN users d ON mr.doctor_id = d.id
      JOIN doctors doc ON mr.doctor_id = doc.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filter by role
    if (req.user.role === 'doctor') {
      query += ` AND mr.doctor_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'patient') {
      query += ` AND mr.patient_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }
    
    // Additional filters
    if (patientId) {
      query += ` AND mr.patient_id = $${paramCount}`;
      params.push(patientId);
      paramCount++;
    }
    
    if (doctorId) {
      query += ` AND mr.doctor_id = $${paramCount}`;
      params.push(doctorId);
      paramCount++;
    }
    
    query += ` ORDER BY mr.record_date DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

// Get medical record by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT 
        mr.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
       FROM medical_records mr
       JOIN users p ON mr.patient_id = p.id
       JOIN users d ON mr.doctor_id = d.id
       JOIN doctors doc ON mr.doctor_id = doc.id
       WHERE mr.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    const record = result.rows[0];
    
    // Authorization check
    if (req.user.role === 'patient' && req.user.id !== record.patient_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'doctor' && req.user.id !== record.doctor_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

// Create medical record (Doctor only)
router.post('/', authenticateToken, authorizeRole('doctor', 'admin'), async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      date,
      diagnosis,
      prescription,
      notes,
      bloodPressure,
      heartRate,
      temperature
    } = req.body;
    
    if (!patientId || !date || !diagnosis || !prescription) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const doctorId = req.user.role === 'doctor' ? req.user.id : req.body.doctorId;
    const recordId = `rec-${Date.now()}`;
    
    await db.query(
      `INSERT INTO medical_records 
       (id, patient_id, doctor_id, appointment_id, record_date, diagnosis, prescription, notes, blood_pressure, heart_rate, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        recordId,
        patientId,
        doctorId,
        appointmentId || null,
        date,
        diagnosis,
        prescription,
        notes || null,
        bloodPressure || null,
        heartRate || null,
        temperature || null
      ]
    );
    
    const newRecord = await db.query(
      `SELECT 
        mr.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
       FROM medical_records mr
       JOIN users p ON mr.patient_id = p.id
       JOIN users d ON mr.doctor_id = d.id
       JOIN doctors doc ON mr.doctor_id = doc.id
       WHERE mr.id = $1`,
      [recordId]
    );
    
    res.status(201).json(newRecord.rows[0]);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// Update medical record (Doctor who created it or Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescription, notes, bloodPressure, heartRate, temperature } = req.body;
    
    // Check if record exists and authorization
    const existing = await db.query('SELECT * FROM medical_records WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }
    
    if (req.user.role === 'doctor' && req.user.id !== existing.rows[0].doctor_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    let updateQuery = 'UPDATE medical_records SET ';
    const updates = [];
    const params = [];
    let paramCount = 1;
    
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
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }
    if (bloodPressure !== undefined) {
      updates.push(`blood_pressure = $${paramCount}`);
      params.push(bloodPressure);
      paramCount++;
    }
    if (heartRate !== undefined) {
      updates.push(`heart_rate = $${paramCount}`);
      params.push(heartRate);
      paramCount++;
    }
    if (temperature !== undefined) {
      updates.push(`temperature = $${paramCount}`);
      params.push(temperature);
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
        mr.*,
        p.name as patient_name,
        d.name as doctor_name,
        doc.specialization
       FROM medical_records mr
       JOIN users p ON mr.patient_id = p.id
       JOIN users d ON mr.doctor_id = d.id
       JOIN doctors doc ON mr.doctor_id = doc.id
       WHERE mr.id = $1`,
      [id]
    );
    
    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

// Delete medical record (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM medical_records WHERE id = $1', [id]);
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
});

module.exports = router;
