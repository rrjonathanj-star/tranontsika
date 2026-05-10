const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service not configured:', error.message);
  } else {
    console.log('Email service ready');
  }
});

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Tranontsika Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Welcome to Tranontsika! 🏠</h2>
          <p>Hello ${firstName},</p>
          <p>Thank you for signing up with Tranontsika. To complete your registration and secure your account, please verify your email address.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">Or copy and paste this link: ${verificationLink}</p>
          
          <p>This link will expire in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email or contact support.
          </p>
          <p style="color: #999; font-size: 12px;">
            © 2026 Tranontsika. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Tranontsika Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">Or copy and paste this link: ${resetLink}</p>
          
          <p>This link will expire in 1 hour.</p>
          
          <p style="color: #e74c3c; font-weight: bold;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2026 Tranontsika. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
};