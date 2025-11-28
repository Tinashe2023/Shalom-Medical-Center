const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from database
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if email is verified (except for admin and doctor roles)
    if (user.role === 'patient' && !user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailNotVerified: true
      });
    }

    // Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get additional info based on role
    let userData = { ...user };
    delete userData.password; // Remove password from response
    delete userData.verification_token; // Remove sensitive data
    delete userData.reset_token; // Remove sensitive data
    delete userData.reset_token_expiry; // Remove sensitive data

    if (user.role === 'doctor') {
      const doctorInfo = await db.query(
        'SELECT specialization, experience FROM doctors WHERE id = $1',
        [user.id]
      );
      if (doctorInfo.rows.length > 0) {
        userData = { ...userData, ...doctorInfo.rows[0] };
      }
    } else if (user.role === 'patient') {
      const patientInfo = await db.query(
        'SELECT date_of_birth, blood_group, address FROM patients WHERE id = $1',
        [user.id]
      );
      if (patientInfo.rows.length > 0) {
        userData = { ...userData, ...patientInfo.rows[0] };
      }
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register (Patient only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user ID
    const userId = `pat-${Date.now()}`;

    // Insert into users table
    await db.query(
      `INSERT INTO users (id, email, password, role, name, phone, email_verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email, hashedPassword, 'patient', name, phone || null, false, verificationToken]
    );

    // Insert into patients table
    await db.query(
      `INSERT INTO patients (id, date_of_birth, blood_group, address)
       VALUES ($1, $2, $3, $4)`,
      [userId, dateOfBirth || null, bloodGroup || null, address || null]
    );

    // Send verification email
    const emailService = require('../email-service');
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      email: email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const result = await db.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Update user to verified and clear token
    await db.query(
      'UPDATE users SET email_verified = true, verification_token = null WHERE id = $1',
      [user.id]
    );

    // Send welcome email
    const emailService = require('../email-service');
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if welcome email fails
    }

    res.json({
      message: 'Email verified successfully! You can now login.',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Send reset email
    const emailService = require('../email-service');
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user with valid reset token
    const result = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password = $1, reset_token = null, reset_token_expiry = null WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({
      message: 'Password reset successful! You can now login with your new password.',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;
