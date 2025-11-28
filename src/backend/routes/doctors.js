const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Get all unique specializations with doctor count
router.get('/specializations', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.specialization,
        COUNT(d.id) as doctor_count,
        sc.description,
        sc.common_symptoms,
        sc.icon
      FROM doctors d
      LEFT JOIN specialization_categories sc ON d.specialization = sc.name
      GROUP BY d.specialization, sc.description, sc.common_symptoms, sc.icon
      ORDER BY d.specialization
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
});

// Get doctors by specialization with load status
router.get('/by-specialization/:specialization', authenticateToken, async (req, res) => {
  try {
    const { specialization } = req.params;
    const { date } = req.query; // Optional date parameter for load calculation

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get doctors with their appointment counts for the specified date
    const result = await db.query(`
      SELECT 
        u.*,
        d.specialization,
        d.experience,
        COUNT(a.id) FILTER (WHERE a.status IN ('scheduled', 'pending')) as appointment_count
      FROM users u
      JOIN doctors d ON u.id = d.id
      LEFT JOIN appointments a ON d.id = a.doctor_id 
        AND a.appointment_date = $2
        AND a.status IN ('scheduled', 'pending')
      WHERE u.role = 'doctor' AND d.specialization = $1
      GROUP BY u.id, d.specialization, d.experience
      ORDER BY appointment_count ASC, u.name
    `, [specialization, targetDate]);

    // Calculate load status for each doctor
    const doctors = result.rows.map(doctor => {
      const { password, ...doctorData } = doctor;
      const count = parseInt(doctor.appointment_count) || 0;

      return {
        ...doctorData,
        appointmentCount: count,
        loadStatus: count >= 10 ? 'full' : count >= 8 ? 'busy' : 'available'
      };
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get all doctors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT u.*, d.specialization, d.experience
      FROM users u
      JOIN doctors d ON u.id = d.id
      WHERE u.role = 'doctor'
    `;

    const params = [];

    if (search) {
      query += ` AND (u.name ILIKE $1 OR d.specialization ILIKE $1 OR u.email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.name`;

    const result = await db.query(query, params);

    // Remove passwords
    const doctors = result.rows.map(doctor => {
      const { password, ...doctorData } = doctor;
      return doctorData;
    });

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get doctor by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT u.*, d.specialization, d.experience
       FROM users u
       JOIN doctors d ON u.id = d.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = result.rows[0];
    delete doctor.password;

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Get doctor's availability/schedule
router.get('/:id/availability', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT da.*, 
              json_agg(
                json_build_object(
                  'id', ts.id,
                  'start', ts.start_time,
                  'end', ts.end_time
                ) ORDER BY ts.start_time
              ) FILTER (WHERE ts.id IS NOT NULL) as slots
       FROM doctor_availability da
       LEFT JOIN time_slots ts ON da.id = ts.availability_id
       WHERE da.doctor_id = $1
       GROUP BY da.id, da.doctor_id, da.day_of_week, da.available
       ORDER BY 
         CASE da.day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END`,
      [id]
    );

    const availability = result.rows.map(day => ({
      day: day.day_of_week,
      available: day.available,
      slots: day.slots || []
    }));

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Create doctor (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { name, email, password, specialization, phone, experience } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check if email exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const doctorId = `doc-${Date.now()}`;

    await db.transaction(async (client) => {
      // Insert user
      await client.query(
        `INSERT INTO users (id, email, password, role, name, phone)
         VALUES ($1, $2, $3, 'doctor', $4, $5)`,
        [doctorId, email, password, name, phone || null]
      );

      // Insert doctor info
      await client.query(
        `INSERT INTO doctors (id, specialization, experience)
         VALUES ($1, $2, $3)`,
        [doctorId, specialization, experience || null]
      );

      // Create default availability
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        const available = day !== 'Sunday';
        const availResult = await client.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, available)
           VALUES ($1, $2, $3) RETURNING id`,
          [doctorId, day, available]
        );

        if (available) {
          const availId = availResult.rows[0].id;
          await client.query(
            `INSERT INTO time_slots (availability_id, start_time, end_time)
             VALUES ($1, '09:00', '12:00'), ($1, '14:00', '17:00')`,
            [availId]
          );
        }
      }
    });

    const newDoctor = await db.query(
      `SELECT u.*, d.specialization, d.experience
       FROM users u
       JOIN doctors d ON u.id = d.id
       WHERE u.id = $1`,
      [doctorId]
    );

    const doctor = newDoctor.rows[0];
    delete doctor.password;

    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// Update doctor (Admin only)
router.put('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, phone, experience } = req.body;

    await db.transaction(async (client) => {
      // Update user info
      await client.query(
        `UPDATE users SET name = $1, email = $2, phone = $3
         WHERE id = $4`,
        [name, email, phone || null, id]
      );

      // Update doctor info
      await client.query(
        `UPDATE doctors SET specialization = $1, experience = $2
         WHERE id = $3`,
        [specialization, experience || null, id]
      );
    });

    const updated = await db.query(
      `SELECT u.*, d.specialization, d.experience
       FROM users u
       JOIN doctors d ON u.id = d.id
       WHERE u.id = $1`,
      [id]
    );

    const doctor = updated.rows[0];
    delete doctor.password;

    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// Update doctor availability
router.put('/:id/availability', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    // Verify user is the doctor or admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.transaction(async (client) => {
      for (const day of availability) {
        // Get or create availability record
        const availResult = await client.query(
          `INSERT INTO doctor_availability (doctor_id, day_of_week, available)
           VALUES ($1, $2, $3)
           ON CONFLICT (doctor_id, day_of_week)
           DO UPDATE SET available = $3
           RETURNING id`,
          [id, day.day, day.available]
        );

        const availId = availResult.rows[0].id;

        // Delete existing slots
        await client.query('DELETE FROM time_slots WHERE availability_id = $1', [availId]);

        // Insert new slots
        if (day.available && day.slots && day.slots.length > 0) {
          for (const slot of day.slots) {
            await client.query(
              `INSERT INTO time_slots (availability_id, start_time, end_time)
               VALUES ($1, $2, $3)`,
              [availId, slot.start, slot.end]
            );
          }
        }
      }
    });

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Delete doctor (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;
