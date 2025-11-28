const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

/**
 * Send email verification link to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Shalom Medical Center</h1>
          </div>
          
          <h2>Welcome, ${name}!</h2>
          
          <p>Thank you for registering with our Shalom Medical Center. We're excited to have you on board!</p>
          
          <p>To complete your registration and access your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
          </div>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset link to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Shalom Medical Center</h1>
          </div>
          
          <h2>Password Reset Request</h2>
          
          <p>Hello ${name},</p>
          
          <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
          </div>
          
          <div class="alert">
            <strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged. Your account is secure.
          </div>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send welcome email after successful verification
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Shalom Medical Center!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .success {
            background-color: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Shalom Medical Center</h1>
          </div>
          
          <div class="success">
            <h2 style="margin-top: 0;">✅ Email Verified Successfully!</h2>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Your email has been successfully verified! You can now access all features of the Shalom Medical Center.</p>
          
          <p><strong>What you can do now:</strong></p>
          <ul>
            <li>Book appointments with our doctors</li>
            <li>View your medical history</li>
            <li>Manage your profile information</li>
            <li>Receive appointment reminders</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <div class="footer">
            <p>Thank you for choosing Shalom Medical Center!</p>
            <p>We're here to provide you with the best healthcare experience.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment confirmation email to patient
 * @param {object} appointment - Appointment details
 * @param {object} patient - Patient details
 * @param {object} doctor - Doctor details
 */
const sendAppointmentConfirmationEmail = async (appointment, patient, doctor) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: patient.email,
    subject: '✅ Appointment Confirmed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .details { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
          .detail-label { font-weight: bold; width: 150px; color: #666; }
          .detail-value { flex: 1; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Appointment Confirmed</h1>
          </div>
          
          <div class="success">
            <h2 style="margin-top: 0;">✅ Your appointment has been scheduled!</h2>
          </div>
          
          <p>Hello ${patient.name},</p>
          
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          
          <div class="details">
            <div class="detail-row">
              <div class="detail-label">Doctor:</div>
              <div class="detail-value">${doctor.name}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Specialization:</div>
              <div class="detail-value">${doctor.specialization}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div class="detail-value">${appointmentDate}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Time:</div>
              <div class="detail-value">${appointment.appointment_time}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Reason:</div>
              <div class="detail-value">${appointment.reason}</div>
            </div>
          </div>
          
          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring your ID and insurance card (if applicable)</li>
            <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
          </ul>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

/**
 * Send queue confirmation email to patient
 * @param {object} appointment - Appointment details
 * @param {object} patient - Patient details
 * @param {object} doctor - Doctor details
 * @param {number} queuePosition - Position in queue
 */
const sendQueueConfirmationEmail = async (appointment, patient, doctor, queuePosition) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: patient.email,
    subject: '⏳ Added to Waitlist',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .queue-badge { display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; border-radius: 50px; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .details { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Added to Waitlist</h1>
          </div>
          
          <p>Hello ${patient.name},</p>
          
          <p>Dr. ${doctor.name} is currently fully booked for ${appointmentDate}. You have been added to the waitlist.</p>
          
          <div style="text-align: center;">
            <div class="queue-badge">Queue Position: #${queuePosition}</div>
          </div>
          
          <div class="warning">
            <strong>📧 We'll notify you!</strong> If a slot becomes available, you'll automatically be assigned and receive a confirmation email with your appointment time.
          </div>
          
          <div class="details">
            <p><strong>Waitlist Details:</strong></p>
            <p>Doctor: ${doctor.name} (${doctor.specialization})</p>
            <p>Requested Date: ${appointmentDate}</p>
            <p>Reason: ${appointment.reason}</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>You'll be automatically assigned if a slot opens up</li>
            <li>You'll receive an email confirmation with your appointment time</li>
            <li>Your position in the queue: #${queuePosition}</li>
          </ul>
          
          <p>Alternatively, you can book with another available doctor for the same specialization.</p>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Queue confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending queue confirmation email:', error);
    throw error;
  }
};

/**
 * Send queue assignment email to patient
 * @param {object} appointment - Appointment details
 * @param {object} patient - Patient details
 * @param {object} doctor - Doctor details
 */
const sendQueueAssignmentEmail = async (appointment, patient, doctor) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: patient.email,
    subject: '🎉 Appointment Assigned from Waitlist!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .details { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Great News!</h1>
          </div>
          
          <div class="success">
            <h2 style="margin-top: 0;">✅ Your appointment has been assigned!</h2>
          </div>
          
          <p>Hello ${patient.name},</p>
          
          <p>Good news! A slot has become available and your appointment has been automatically scheduled.</p>
          
          <div class="details">
            <p><strong>Appointment Details:</strong></p>
            <p>Doctor: ${doctor.name} (${doctor.specialization})</p>
            <p>Date: ${appointmentDate}</p>
            <p>Time: ${appointment.appointment_time}</p>
            <p>Reason: ${appointment.reason}</p>
          </div>
          
          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Please arrive 10 minutes before your scheduled time</li>
            <li>Bring your ID and insurance card (if applicable)</li>
            <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
          </ul>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>We look forward to seeing you!</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Queue assignment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending queue assignment email:', error);
    throw error;
  }
};

/**
 * Send prescription email to patient after appointment completion
 * @param {object} appointment - Appointment details
 * @param {object} patient - Patient details
 * @param {object} doctor - Doctor details
 * @param {object} prescription - Prescription details
 */
const sendPrescriptionEmail = async (appointment, patient, doctor, prescription) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: patient.email,
    subject: '📋 Your Prescription and Treatment Summary',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .section { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .section-title { color: #3b82f6; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .prescription-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Treatment Summary</h1>
          </div>
          
          <p>Hello ${patient.name},</p>
          
          <p>Your appointment with Dr. ${doctor.name} on ${appointmentDate} has been completed. Here is your treatment summary:</p>
          
          <div class="section">
            <div class="section-title">Diagnosis</div>
            <p>${prescription.diagnosis || 'N/A'}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Prescription</div>
            <div class="prescription-box">
              <p style="margin: 0; white-space: pre-wrap;">${prescription.prescription || 'No prescription provided'}</p>
            </div>
          </div>
          
          ${prescription.notes ? `
          <div class="section">
            <div class="section-title">Doctor's Instructions</div>
            <p style="white-space: pre-wrap;">${prescription.notes}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">Appointment Details</div>
            <p>Doctor: ${doctor.name} (${doctor.specialization})</p>
            <p>Date: ${appointmentDate}</p>
            <p>Time: ${appointment.appointment_time}</p>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Follow the prescribed medication schedule carefully</li>
            <li>Contact your doctor if you experience any side effects</li>
            <li>Schedule a follow-up appointment if recommended</li>
            <li>Keep this email for your medical records</li>
          </ul>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
            <p>For medical emergencies, please call emergency services immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Prescription email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending prescription email:', error);
    throw error;
  }
};

/**
 * Send new appointment notification to doctor
 * @param {object} appointment - Appointment details
 * @param {object} doctor - Doctor details
 * @param {object} patient - Patient details
 */
const sendDoctorAppointmentNotification = async (appointment, doctor, patient) => {
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const mailOptions = {
    from: `"Shalom Medical Center" <${process.env.EMAIL_USER}>`,
    to: doctor.email,
    subject: '📅 New Appointment Scheduled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; border: 1px solid #e0e0e0; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .details { background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 New Appointment</h1>
          </div>
          
          <p>Hello Dr. ${doctor.name},</p>
          
          <p>A new appointment has been scheduled with you.</p>
          
          <div class="details">
            <p><strong>Patient:</strong> ${patient.name}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointment_time}</p>
            <p><strong>Reason:</strong> ${appointment.reason}</p>
          </div>
          
          <p>Please review the appointment details in your dashboard.</p>
          
          <div class="footer">
            <p>This is an automated message from Shalom Medical Center.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Doctor appointment notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending doctor appointment notification:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmationEmail,
  sendQueueConfirmationEmail,
  sendQueueAssignmentEmail,
  sendPrescriptionEmail,
  sendDoctorAppointmentNotification
};
