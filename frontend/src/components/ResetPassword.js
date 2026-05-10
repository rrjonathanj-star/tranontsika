import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyResetToken, resetPassword as resetPasswordAPI } from '../services/passwordReset';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('Reset token is missing');
          setLoading(false);
          return;
        }

        const response = await verifyResetToken(token);
        setTokenValid(true);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Invalid or expired reset token');
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const token = searchParams.get('token');
      const response = await resetPasswordAPI(token, newPassword, confirmPassword);
      setMessage(response.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Verifying reset token...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2 style={{ color: '#e74c3c' }}>❌ Reset Link Invalid</h2>
          <p style={{ color: '#e74c3c' }}>{error}</p>
          <p>The reset link may have expired or is invalid.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              background: '#667eea',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
              width: '100%',
            }}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🔐 Create New Password</h2>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password (min 8 characters)"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;