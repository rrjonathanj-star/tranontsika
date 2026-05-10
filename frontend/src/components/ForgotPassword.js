import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../services/passwordReset';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🔐 Reset Your Password</h2>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {!submitted ? (
          <>
            <p>Enter your email address and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your_email@example.com"
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3 style={{ color: '#27ae60' }}>✅ Check Your Email</h3>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>The link will expire in 1 hour.</p>
            </div>
          </>
        )}

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;