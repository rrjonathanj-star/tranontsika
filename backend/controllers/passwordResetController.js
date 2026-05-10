const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { sendPasswordResetEmail } = require('../config/email');
const dotenv = require('dotenv');

dotenv.config();

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const userResult = await client.query(
      'SELECT id, first_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    const { id, first_name } = userResult.rows[0];

    // Delete old password reset tokens
    await client.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used = false',
      [id]
    );

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await client.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [id, hashedToken, expiresAt]
    );

    // Send password reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, first_name, resetLink);

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    const hashedToken = hashToken(token);

    // Find valid reset token
    const tokenResult = await pool.query(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1 AND used = false',
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const { expires_at } = tokenResult.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const client = await pool.connect();
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = hashToken(token);

    // Find valid reset token
    const tokenResult = await client.query(
      'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1 AND used = false',
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const { user_id, expires_at } = tokenResult.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, user_id]
    );

    // Mark reset token as used
    await client.query(
      'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1',
      [hashedToken]
    );

    // Delete all other refresh tokens for this user (force logout everywhere)
    await client.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [user_id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
};