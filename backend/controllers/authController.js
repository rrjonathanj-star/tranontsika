const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const dotenv = require('dotenv');

dotenv.config();

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Signup
const signup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['owner', 'broker', 'renter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if email exists
    const userExists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, role',
      [email, hashedPassword, firstName, lastName, role]
    );

    const userId = userResult.rows[0].id;

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await client.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, hashedToken, expiresAt]
    );

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, firstName, verificationLink);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: userId,
        email: userResult.rows[0].email,
        firstName: userResult.rows[0].first_name,
        role: userResult.rows[0].role,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = hashToken(token);

    // Find verification token
    const tokenResult = await client.query(
      'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1',
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const { user_id, expires_at } = tokenResult.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Update user
    await client.query(
      'UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id = $1',
      [user_id]
    );

    // Delete verification token
    await client.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [user_id]);

    await client.query('COMMIT');

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

// Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const userResult = await client.query('SELECT id, first_name, email_verified FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id, first_name, email_verified } = userResult.rows[0];

    if (email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await client.query(
      'DELETE FROM email_verification_tokens WHERE user_id = $1',
      [id]
    );

    await client.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [id, hashedToken, expiresAt]
    );

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, first_name, verificationLink);

    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

// Login
const login = async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const userResult = await client.query('SELECT id, email, password_hash, first_name, role, email_verified FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await client.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if token exists in database
      const tokenResult = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
        [refreshToken]
      );

      if (tokenResult.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      // Get user
      const userResult = await pool.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
};