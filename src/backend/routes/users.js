const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    
    let query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let user = result.rows[0];
    delete user.password;
    
    // Get role-specific data
    if (role === 'doctor') {
      const doctorInfo = await db.query(
        'SELECT specialization, experience FROM doctors WHERE id = $1',
        [id]
      );
      if (doctorInfo.rows.length > 0) {
        user = { ...user, ...doctorInfo.rows[0] };
      }
    } else if (role === 'patient') {
      const patientInfo = await db.query(
        'SELECT date_of_birth, blood_group, address FROM patients WHERE id = $1',
        [id]
      );
      if (patientInfo.rows.length > 0) {
        user = { ...user, ...patientInfo.rows[0] };
      }
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, role, name, phone, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
