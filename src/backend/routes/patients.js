const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all patients (Admin and Doctor)
router.get('/', authenticateToken, authorizeRole('admin', 'doctor'), async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT u.*, p.date_of_birth, p.blood_group, p.address
      FROM users u
      JOIN patients p ON u.id = p.id
      WHERE u.role = 'patient'
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY u.name`;
    
    const result = await db.query(query, params);
    
    // Remove passwords
    const patients = result.rows.map(patient => {
      const { password, ...patientData } = patient;
      return patientData;
    });
    
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Allow patients to view only their own data, doctors and admins can view any
    if (req.user.role === 'patient' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await db.query(
      `SELECT u.*, p.date_of_birth, p.blood_group, p.address
       FROM users u
       JOIN patients p ON u.id = p.id
       WHERE u.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    const patient = result.rows[0];
    delete patient.password;
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dateOfBirth, bloodGroup, address } = req.body;
    
    // Allow patients to update only their own data, admins can update any
    if (req.user.role === 'patient' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.transaction(async (client) => {
      // Update user info
      await client.query(
        `UPDATE users SET name = $1, email = $2, phone = $3
         WHERE id = $4`,
        [name, email, phone || null, id]
      );
      
      // Update patient info
      await client.query(
        `UPDATE patients SET date_of_birth = $1, blood_group = $2, address = $3
         WHERE id = $4`,
        [dateOfBirth || null, bloodGroup || null, address || null, id]
      );
    });
    
    const updated = await db.query(
      `SELECT u.*, p.date_of_birth, p.blood_group, p.address
       FROM users u
       JOIN patients p ON u.id = p.id
       WHERE u.id = $1`,
      [id]
    );
    
    const patient = updated.rows[0];
    delete patient.password;
    
    res.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
